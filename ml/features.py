# src/features.py
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin


class LagMaker(BaseEstimator, TransformerMixin):
    """
    Добавляет:
      — лаги продаж 7, 14, 30, 60;
      — скользящие средние 7, 30;
      — тренд 7;
      — календарные признаки (dow, week, month, quarter, year);
      — лаги и средние для погодных и трафиковых колонок, если они есть:
            • Temp     — средняя температура
            • Rain_mm  — мм осадков
            • BadWeather (bool / 0-1)
            • FootTraffic — люди/часы
    """

    def __init__(self,
                 sales_lags=(7, 14, 30, 60),
                 exog_lags=(1, 7),
                 ma_windows=(7, 30)):
        self.sales_lags = sales_lags
        self.exog_lags  = exog_lags
        self.ma_windows = ma_windows

        # как называются опциональные колонки-факторы
        self.exog_cols = ["Temp", "Rain_mm", "BadWeather", "FootTraffic"]

    # fit ничего не делает (просто для совместимости со sklearn-pipelines)
    def fit(self, X, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        df = X.copy()

        # убеждаемся, что «Период» — datetime
        if not np.issubdtype(df["Период"].dtype, np.datetime64):
            df["Период"] = pd.to_datetime(df["Период"])

        df = df.sort_values(["Номенклатура", "Период"])
        g_sales = df.groupby("Номенклатура")["Количество"]

        # ── лаги продаж
        for lag in self.sales_lags:
            df[f"lag_{lag}"] = g_sales.shift(lag).fillna(0)

        # ── скользящее среднее/стд
        for win in self.ma_windows:
            df[f"ma_{win}"] = (
                g_sales.rolling(win).mean().reset_index(0, drop=True).fillna(0)
            )

        # ── тренд 7
        df["trend_7"] = g_sales.transform(
            lambda s: (s - s.shift(7)).fillna(0) / 7
        )
        # ── календарные признаки
        df["dow"]     = df["Период"].dt.dayofweek
        df["weeknum"] = df["Период"].dt.isocalendar().week.astype(int)
        df["month"]   = df["Период"].dt.month
        df["quarter"] = df["Период"].dt.quarter
        df["year"]    = df["Период"].dt.year

        # ── экзогенные факторы (погода, трафик) + их лаги
        for col in self.exog_cols:
            if col not in df.columns:
                continue
            g_ex = df.groupby("Номенклатура")[col]
            for lag in self.exog_lags:
                df[f"{col}_lag{lag}"] = g_ex.shift(lag).fillna(g_ex.mean())

            # скользящее среднее 7 для плавности
            df[f"{col}_ma7"] = (
                g_ex.rolling(7).mean().reset_index(0, drop=True)
                    .fillna(g_ex.mean())
            )

        # любые NaN → 0 (после lag/rolling)
        return df.fillna(0.0)


def safe_mape(y_true, y_pred, eps: float = 1.0) -> float:
    """MAPE без бесконечностей: делитель >= eps (обычно 1)."""
    denom = np.maximum(np.abs(y_true), eps)
    return float(np.mean(np.abs((y_true - y_pred) / denom)))
