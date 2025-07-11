# src/train.py
"""
Обучает LightGBM-регрессию и сохраняет artefact models/model-<date>.pkl.
Поддержка:
  • CSV / Parquet / каталог CSV
  • JSON (масив событий, как приходит в API)
  • Optuna-тюнинг по --optuna-trials N  (если N=0 — без тюнинга)
"""

import argparse, json, pickle, pathlib, datetime, logging, sys

import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from lightgbm import LGBMRegressor

from features import LagMaker, safe_mape

try:
    import optuna
except ImportError:
    optuna = None
    logging.warning("Optuna не установлен; гипер-тюнинг будет недоступен")

logging.basicConfig(level=logging.INFO)

# ───────────────────────── data-loader ─────────────────────────
# ───────────────────────── data-loader ─────────────────────────
def load_dataframe(path: pathlib.Path) -> pd.DataFrame:
    """
    CSV / Parquet / каталог CSV / JSON → DataFrame (только продажи).
    Формат даты 'Период' может быть DD.MM.YYYY, поэтому используем
    pd.to_datetime(..., dayfirst=True).
    """
    def _add_period(df: pd.DataFrame) -> pd.DataFrame:
        # единое место преобразования даты
        df["Период"] = pd.to_datetime(df["Период"], dayfirst=True, errors="coerce")
        return df.dropna(subset=["Период"])

    if path.is_dir():                        # каталог *.csv
        files = sorted(path.glob("*.csv"))
        if not files:
            raise FileNotFoundError("В каталоге нет CSV")
        df_cat = pd.concat((pd.read_csv(f) for f in files), ignore_index=True)
        return _add_period(df_cat)

    suf = path.suffix.lower()
    if suf == ".csv":
        return _add_period(pd.read_csv(path))
    if suf == ".parquet":
        return _add_period(pd.read_parquet(path))
    if suf == ".json":
        events = json.load(open(path, encoding="utf-8"))
        sales = [e for e in events if e.get("Type") == "Продажа"]
        if not sales:
            raise ValueError("JSON не содержит продаж (Type=='Продажа')")
        return _add_period(pd.DataFrame(sales))

    raise ValueError(f"Не понимаю формат: {path}")


# ───────────────────────── dataset builder ─────────────────────────
def build_dataset(df: pd.DataFrame):
    df_feat = LagMaker().fit_transform(df)

    grp = df_feat.groupby("Номенклатура")["Количество"]
    df_feat["Target"] = grp.shift(-1)            # ← 1-day ahead
    df_feat = df_feat.dropna(subset=["Target"])

    feature_cols = [c for c in df_feat.columns
                    if c.startswith(("lag_", "ma_", "trend_"))
                    or c in ["dow", "weeknum", "month", "quarter", "year"]]
    return df_feat[["Номенклатура"] + feature_cols + ["Target"]], feature_cols


# ───────────────────────── optuna objective ─────────────────────────
def optuna_objective(trial, X_tr, X_val, y_tr, y_val):
    params = {
        "objective": "regression_l1",
        "n_estimators": trial.suggest_int("n_estimators", 200, 800, step=100),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.15, log=True),
        "num_leaves": trial.suggest_int("num_leaves", 31, 256, step=32),
        "feature_fraction": trial.suggest_float("feature_fraction", 0.6, 1.0),
        "min_child_samples": trial.suggest_int("min_child_samples", 10, 100, step=10),
        "random_state": 42,
    }
    model = LGBMRegressor(**params)
    model.fit(X_tr, y_tr)
    pred = model.predict(X_val)
    return mean_absolute_error(y_val, pred)

# ───────────────────────── main ─────────────────────────
def main(args):
    df = load_dataframe(pathlib.Path(args.input))
    #horizon = args.horizon

    ds, feat_cols = build_dataset(df) #horizon)
    if ds.empty:
        raise RuntimeError("После генерации фичей датасет пуст (мало истории)")

    le = LabelEncoder().fit(ds["Номенклатура"])
    ds["ItemEnc"] = le.transform(ds["Номенклатура"])
    X = ds[["ItemEnc"] + feat_cols]
    y = ds["Target"]
    X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

    # ── подбор гиперпараметров Optuna (опционально)
    if args.optuna_trials and optuna:
        study = optuna.create_study(direction="minimize")
        study.optimize(lambda trial: optuna_objective(trial, X_tr, X_val, y_tr, y_val),
                       n_trials=args.optuna_trials)
        best_params = study.best_params | {
            "objective": "regression_l1",
            "random_state": 42
        }
        logging.info("Optuna best params: %s", best_params)
        model = LGBMRegressor(**best_params)
    else:
        model = LGBMRegressor(
            objective="regression_l1",
            n_estimators=400,
            learning_rate=0.05,
            random_state=42,
        )

    model.fit(X_tr, y_tr)

    y_pred = model.predict(X_val)
    metrics = {
        "mae": mean_absolute_error(y_val, y_pred),
        "mape": safe_mape(y_val, y_pred)
    }
    logging.info("Val MAE=%.3f  MAPE=%.2f%%", metrics["mae"], metrics["mape"] * 100)

    artefact = {
        "model": model,
        "encoder": le,
    #    "horizon": horizon,
        "feature_cols": ["ItemEnc"] + feat_cols,
        "metrics": metrics,
    }
    out_dir = pathlib.Path("models")
    out_dir.mkdir(exist_ok=True)
    out_path = out_dir / f"model-{datetime.date.today()}.pkl"
    pickle.dump(artefact, open(out_path, "wb"))
    logging.info("Saved → %s", out_path)

# ───────────────────────── CLI ─────────────────────────
if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True,
                   help="CSV | Parquet | каталог CSV | JSON событий")
    p.add_argument("--horizon", type=int, default=5)
    p.add_argument("--optuna-trials", type=int, default=0,
                   help="Число итераций Optuna (0=без тюнинга)")
    sys.exit(main(p.parse_args()))
