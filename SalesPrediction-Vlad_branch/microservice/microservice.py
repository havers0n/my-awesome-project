from fastapi import FastAPI, Body, HTTPException
from pydantic import BaseModel
from typing import List, Union, Optional, Dict, Any

import pandas as pd
import numpy as np
import joblib
from datetime import datetime, timedelta
import logging
import os
_abc_lookup: Dict[str, str] = {}
from catboost import CatBoostRegressor

# ------------------------------------------------------------
# FastAPI app
# ------------------------------------------------------------
app = FastAPI(title="Sales Prediction API", version="1.2.0")

# ------------------------------------------------------------
# Пути к артефактам
# ------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH        = os.path.join(BASE_DIR, "cat_train2.pkl")
ITEM_METRICS_PATH = os.path.join(BASE_DIR, "all_sku_metrics_1.csv")
HIST_DATA_PATH = os.path.join(BASE_DIR, "all_predictions_2.parquet")
#HIST_DATA_PATH    = os.path.join(BASE_DIR, "val_predictions_1.csv")
item_metrics = pd.read_csv(ITEM_METRICS_PATH)
item_metrics = item_metrics.rename(columns=str.strip)
_metrics_lookup = item_metrics.set_index("Номенклатура").to_dict(orient="index")
# ----------------- ABC классификация ------------------
def compute_abc_classification(df: pd.DataFrame) -> Dict[str, str]:
    if "Номенклатура" not in df.columns or "TotalQuantity" not in df.columns:
        return {}

    abc_df = (df.groupby("Номенклатура", as_index=False)
                .agg({"TotalQuantity": "sum"})
                .sort_values("TotalQuantity", ascending=False)
                .reset_index(drop=True))
    abc_df["cum_sum"] = abc_df["TotalQuantity"].cumsum()
    abc_df["cum_perc"] = abc_df["cum_sum"] / abc_df["TotalQuantity"].sum()

    def classify(p):
        if p <= 0.7:
            return "A"
        elif p <= 0.9:
            return "B"
        else:
            return "C"

    abc_df["class"] = abc_df["cum_perc"].apply(classify)
    return dict(zip(abc_df["Номенклатура"], abc_df["class"]))
# ------------------------------------------------------------
# Гиперпараметры корректировок прогноза (можно править через ENV)
# ------------------------------------------------------------
# Минимальный объём прогноза: смотрим историю за N дней и берём долю
FLOOR_LOOKBACK_DAYS = int(os.getenv("FLOOR_LOOKBACK_DAYS", 14))
FLOOR_COEF          = float(os.getenv("FLOOR_COEF", 0.85))

# Safety Stock: сколько дней буфера держать сверх прогноза
SAFETY_DAYS         = int(os.getenv("SAFETY_DAYS", 3))
# По скольким последним дням считать среднюю дневную продажу для safety
SAFETY_WINDOW_DAYS  = int(os.getenv("SAFETY_WINDOW_DAYS", 30))

# Для возможной bias-коррекции (пока не используем, но читаем)
BIAS_CLIP_LOWER     = float(os.getenv("BIAS_CLIP_LOWER", 0.5))
BIAS_CLIP_UPPER     = float(os.getenv("BIAS_CLIP_UPPER", 3.0))
APPLY_BIAS          = os.getenv("APPLY_BIAS", "0") in {"1", "true", "TRUE", "yes"}

# Параметры калибровки для сглаживания агрессивных прогнозов
CALIBRATION_ENABLED = os.getenv("CALIBRATION_ENABLED", "1") in {"1", "true", "TRUE", "yes"}
CALIBRATION_ALPHA   = float(os.getenv("CALIBRATION_ALPHA", 0.3))  # вес исторических данных
CALIBRATION_MAX_RATIO = float(os.getenv("CALIBRATION_MAX_RATIO", 2.5))  # максимальный рост относительно истории
CALIBRATION_MIN_RATIO = float(os.getenv("CALIBRATION_MIN_RATIO", 0.4))  # минимальное падение относительно истории

# ------------------------------------------------------------
# Логирование
# ------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================
# Загрузка модели и данных
# ============================================================
# Загрузка модели и данных
# ============================================================
try:
    model: CatBoostRegressor = joblib.load(MODEL_PATH)

    # --- метрики по SKU
    item_metrics = pd.read_csv(ITEM_METRICS_PATH)
    item_metrics = item_metrics.rename(columns=str.strip)

    # --- история (валидационный набор с фактами и фичами)
    #historical_data = pd.read_csv(HIST_DATA_PATH)
    historical_data = pd.read_parquet(HIST_DATA_PATH)


    # --- расчёт оценочного остатка, если нет API
    if {"TotalQuantity", "SupplyQty", "Номенклатура", "Дата"}.issubset(historical_data.columns):
        historical_data["NetFlow"] = historical_data["SupplyQty"] - historical_data["TotalQuantity"]
        historical_data["StockEst"] = (
            historical_data.sort_values("Дата")
                           .groupby("Номенклатура")["NetFlow"]
                           .cumsum()
        )
        _stock_est_lookup = (
            historical_data.sort_values("Дата")
                           .groupby("Номенклатура")
                           .tail(1)
                           .set_index("Номенклатура")["StockEst"]
                           .to_dict()
        )
    else:
        _stock_est_lookup = {}

    # нормализуем дату
    if "Дата" in historical_data.columns:
        historical_data["Дата"] = pd.to_datetime(historical_data["Дата"])
    elif "Период" in historical_data.columns:
        historical_data["Дата"] = pd.to_datetime(historical_data["Период"])
    else:
        raise ValueError("В val_predictions_1.csv нет колонки 'Дата' или 'Период'.")

    # убедимся, что есть колонка 'Код'
    if "Код" not in historical_data.columns:
        if "НоменклатураКод" in historical_data.columns:
            historical_data = historical_data.rename(columns={"НоменклатураКод": "Код"})
        else:
            historical_data["Код"] = ""

    # числовые поля (если есть)
    for col in ["TotalQuantity", "Pred", "SupplyQty", "Stock"]:
        if col in historical_data.columns:
            historical_data[col] = pd.to_numeric(historical_data[col], errors="coerce").fillna(0)

    logger.info(
        "Модель загружена. Исторических записей: %d. SKU в метриках: %d.",
        len(historical_data),
        len(item_metrics),
    )

except Exception as e:
    logger.exception("Ошибка загрузки модели/данных: %s", e)
    raise

# вне блока try — классификация ABC
_abc_lookup = compute_abc_classification(historical_data)
# ============================================================
# Pydantic-схемы входа
# ============================================================
class DaysHeader(BaseModel):
    DaysCount: int


class SaleEvent(BaseModel):
    Type: Optional[str] = "Продажа"
    Период: Union[datetime, str]
    Номенклатура: str
    ВидНоменклатуры: Optional[str] = None
    Поставщик: Optional[str] = None
    Производитель: Optional[str] = None
    Вес: Optional[float] = None
    Артикул: Optional[str] = None
    Код: Optional[str] = None
    Группа: Optional[str] = None
    Количество: Optional[int] = None
    Сумма: Optional[float] = None
    Срок_годности_час: Optional[int] = None
    Наличие_товара: Optional[bool] = None
    Наличие_товара_в_магазине: Optional[bool] = None
    Категория_товара: Optional[str] = None
    Задержка_поставки_дн: Optional[int] = None
    Адрес_точки: Optional[str] = None
    Заканчивался_ли_продукт: Optional[bool] = None
    Цена_на_полке: Optional[float] = None
    Часов_работала_точка: Optional[int] = None
    Остаток_в_магазине: Optional[int] = None
    StoreId: Optional[int] = None
    Процент_скидки: Optional[int] = None

    class Config:
        extra = "ignore"


class SupplyEvent(BaseModel):
    Type: str = "Поставка"
    Период: Union[datetime, str]
    Номенклатура: str
    Код: Optional[str] = None
    Количество: int
    Цена: Optional[float] = None

    class Config:
        extra = "ignore"


# Пэйлоад старого стиля /forecast
ForecastPayload = List[Union[DaysHeader, SaleEvent, SupplyEvent]]


# ============================================================
# Схемы ответов (расширены)
# ============================================================
class MetricResponse(BaseModel):
    MAPE: float
    MAE: float
    DaysPredict: int


class DetailResponse(BaseModel):
    Период: str
    Номенклатура: str
    Код: str
    MAPE: float
    MAE: float
    Количество: int              # прогноз продаж на период
    SafetyStock: Optional[int] = None
    RecommendedOrder: Optional[int] = None
    ABC_Class: Optional[str] = None
    CurrentStock: Optional[float] = None
# ============================================================
# Фичи (как в обученной модели)
# ============================================================
FEATURE_COLS = [
    "ItemName_Enc", "Code_Enc", "Group_Enc", "Type_Enc",
    "Sales_Avg_7", "Sales_Avg_30", "Sales_Min_7", "Sales_Std_7",
    "Sales_Lag_1", "Sales_Lag_7", "Sales_Lag_30",
    "Sales_vs_7d_avg", "Sales_Pct_Change_1d", "Sales_Pct_Change_7d",
    "Sales_Lag_90", "Sales_Lag_180", "Sales_Avg_90", "Sales_Avg_180",
    "SupplyQty", "Supply_Lag_1", "Supply_Lag_7", "Stock",
    "DaysSinceSupply", "Supply_vs_Sales_7d", "IsSupplyDay",
    "Месяц", "ДеньНедели", "ДеньМесяца", "Квартал",
    "IsWeekend", "IsHoliday_Impact",
    "NoSalesFlag", "NoSupplyFlag", "IsMissing_Min_7",
    "IsOutOfStock", "IsColdStart", "ABC_Enc",
    "СрокГодности", "HasShelfLife"
]
# алиас для обратной совместимости
feature_cols = FEATURE_COLS

CAT_COLS = ["ItemName_Enc", "Code_Enc", "Group_Enc", "Type_Enc"]


# ============================================================
# Глобальные метрики
# ============================================================
def _global_mape() -> float:
    m = item_metrics["MAPE"].dropna()
    if m.empty:
        return 0.0
    # если данные в долях
    if m.median() <= 1:
        return float(m.mean() * 100)
    return float(m.mean())


def _global_mae() -> float:
    m = item_metrics["MAE"].dropna()
    return float(m.mean()) if not m.empty else 0.0


# кэш метрик
_metrics_lookup = item_metrics.set_index("Номенклатура").to_dict(orient="index")


def get_item_metrics(item_name: str, item_code: Optional[str]) -> tuple:
    row = _metrics_lookup.get(item_name)
    if row is not None:
        mape = row.get("MAPE", np.nan)
        mae  = row.get("MAE", np.nan)
    else:
        mape = _global_mape()
        mae  = _global_mae()
        logger.warning("Метрики для '%s' не найдены, берём средние.", item_name)
    mape = float(mape) if pd.notna(mape) else _global_mape()
    mae  = float(mae)  if pd.notna(mae)  else _global_mae()
    return mape, mae


# ============================================================
# Bias lookup по SKU (факт / предсказание на валидации) — пока не используется
# ============================================================
if {"Номенклатура", "TotalQuantity", "Pred"}.issubset(historical_data.columns):
    _bias_df = (historical_data
                .groupby("Номенклатура", as_index=False)
                .agg(fact_sum=("TotalQuantity", "sum"),
                     pred_sum=("Pred", "sum")))
    _bias_df["bias"] = np.where(_bias_df["pred_sum"] > 0,
                                _bias_df["fact_sum"] / _bias_df["pred_sum"],
                                1.0)
    _bias_df["bias"] = _bias_df["bias"].clip(BIAS_CLIP_LOWER, BIAS_CLIP_UPPER)
    _sku_bias_lookup = dict(zip(_bias_df["Номенклатура"], _bias_df["bias"]))
else:
    _sku_bias_lookup = {}


# ============================================================
# ЛУКАП строки истории по SKU (последняя запись)
# ============================================================
def _lookup_hist_row(item_name: str, item_code: Optional[str]) -> Optional[pd.Series]:
    if item_code is not None:
        m = historical_data["Код"].astype(str) == str(item_code)
        if m.any():
            return historical_data.loc[m].sort_values("Дата").iloc[-1]
    m = historical_data["Номенклатура"] == item_name
    if m.any():
        return historical_data.loc[m].sort_values("Дата").iloc[-1]
    return None


# ============================================================
# Средняя дневная продажа по истории (для safety)
# ============================================================
def _avg_daily_hist(
    item_name: str,
    item_code: Optional[str],
    window: int = SAFETY_WINDOW_DAYS,
) -> Optional[float]:
    mask = (historical_data["Номенклатура"] == item_name)
    if item_code is not None:
        mask |= (historical_data["Код"].astype(str) == str(item_code))
    df = historical_data.loc[mask].sort_values("Дата").tail(window)
    if df.empty or "TotalQuantity" not in df.columns:
        return None
    return float(df["TotalQuantity"].mean())


# ============================================================
# Недавние факты (для floor, только ДО start_date)
# ============================================================
def _recent_hist_daily(
    item_name: str,
    item_code: Optional[str],
    start_date: pd.Timestamp,
    lookback: int = FLOOR_LOOKBACK_DAYS,
) -> Optional[float]:
    mask = (historical_data["Номенклатура"] == item_name)
    if item_code is not None:
        mask |= (historical_data["Код"].astype(str) == str(item_code))
    df = (historical_data.loc[mask]
          .loc[lambda d: d["Дата"] < start_date]
          .sort_values("Дата")
          .tail(lookback))
    if df.empty or "TotalQuantity" not in df.columns:
        return None
    return float(df["TotalQuantity"].mean())


# ============================================================
# Текущий остаток (из события или истории)
# ============================================================
def _current_stock(item_name: str,
                   item_code: Optional[str],
                   event_obj: Optional[Any] = None) -> int:
    # 1) из события
    if event_obj is not None:
        for fld in ("Остаток_в_магазине", "Остаток", "Stock"):
            v = getattr(event_obj, fld, None)
            if v is not None:
                try:
                    return int(v)
                except Exception:
                    pass

    # 2) из истории
    row = _lookup_hist_row(item_name, item_code)
    if row is not None and "Stock" in row.index:
        try:
            return int(pd.to_numeric(row["Stock"], errors="coerce") or 0)
        except Exception:
            pass

    # 3) из оценочного словаря
    v = _stock_est_lookup.get(item_name)
    if v is not None:
        try:
            return int(round(v))
        except Exception:
            pass

    return 0



# ============================================================
# Safety + Recommended Order
# ============================================================
def _safety_and_order(item_name: str,
                      item_code: Optional[str],
                      period_days: int,
                      event_obj: Optional[Any] = None,
                      forecast_qty: int = 0) -> (int):
    avg_daily = _avg_daily_hist(item_name, item_code, SAFETY_WINDOW_DAYS) or 0.0
    safety_stock = int(round(avg_daily * SAFETY_DAYS))
    cur_stock = _current_stock(item_name, item_code, event_obj)
    recommended = max(0, forecast_qty + safety_stock - cur_stock)
    return safety_stock, recommended


# ============================================================
# Построение признаков для прогноза (одна дата)
# ============================================================
def get_item_features(
    item_name: str,
    item_code: Optional[str],
    target_date: pd.Timestamp,
    price: Optional[float] = None,
) ->Dict[str, Any]:
    row = _lookup_hist_row(item_name, item_code)

    if row is None:
        logger.warning("SKU '%s' (code=%s) не найден в истории.", item_name, item_code)
        feats = {c: 0.0 for c in FEATURE_COLS}
        feats["ItemName_Enc"] = int(hash(item_name) % 100000)
        feats["Code_Enc"]     = int(hash(item_code) % 100000) if item_code else -1
        feats["Group_Enc"]    = -1
        feats["Type_Enc"]     = -1
    else:
        feats = {}
        for f in FEATURE_COLS:
            v = row.get(f, 0)
            if f in CAT_COLS:
                feats[f] = int(pd.to_numeric(v, errors="coerce") if pd.notna(v) else -1)
            else:
                feats[f] = float(pd.to_numeric(v, errors="coerce") if pd.notna(v) else 0.0)

    # актуализируем календарь
    feats["Месяц"]      = int(target_date.month)
    feats["ДеньМесяца"] = int(target_date.day)
    feats["ДеньНедели"] = int(target_date.weekday())
    feats["Квартал"]    = int((target_date.month - 1) // 3 + 1)
    feats["IsWeekend"]  = int(target_date.weekday() in [5, 6])
    # IsHoliday_Impact оставляем как было (из истории) — ок для MVP

    # страховка на случай пропусков
    for c in FEATURE_COLS:
        if c not in feats:
            feats[c] = -1 if c in CAT_COLS else 0.0

    return feats


# ============================================================
# Функция калибровки для сглаживания агрессивных прогнозов
# ============================================================
def _apply_calibration(
    raw_forecast: float,
    historical_avg: Optional[float],
    item_name: str,
    abc_class: Optional[str] = None
) -> float:
    """Применяет калибровку для сглаживания слишком агрессивных прогнозов.
    
    Args:
        raw_forecast: Сырой прогноз модели
        historical_avg: Средняя историческая продажа за аналогичный период
        item_name: Название товара (для логирования)
        abc_class: ABC класс товара (для разных стратегий)
        
    Returns:
        Откалиброванный прогноз
    """
    if not CALIBRATION_ENABLED or historical_avg is None or historical_avg <= 0:
        return raw_forecast
    
    # Отношение прогноза к истории
    ratio = raw_forecast / historical_avg
    
    # Разные стратегии калибровки в зависимости от ABC класса
    if abc_class == "A":
        # Для класса A - более консервативная калибровка
        max_ratio = CALIBRATION_MAX_RATIO * 0.8
        min_ratio = CALIBRATION_MIN_RATIO * 1.2
    elif abc_class == "B":
        # Для класса B - стандартная калибровка
        max_ratio = CALIBRATION_MAX_RATIO
        min_ratio = CALIBRATION_MIN_RATIO
    else:
        # Для класса C - более агрессивная калибровка допустима
        max_ratio = CALIBRATION_MAX_RATIO * 1.3
        min_ratio = CALIBRATION_MIN_RATIO * 0.8
    
    # Если прогноз слишком агрессивный (рост больше чем max_ratio)
    if ratio > max_ratio:
        # Сглаживаем: берём взвешенную сумму исторического среднего и прогноза
        calibrated = (CALIBRATION_ALPHA * historical_avg + 
                     (1 - CALIBRATION_ALPHA) * raw_forecast)
        # Но не выше чем max_ratio * historical_avg
        calibrated = min(calibrated, max_ratio * historical_avg)
        
        logger.info(
            "Калибровка агрессивного прогноза для '%s' (ABC:%s): %.1f -> %.1f (ratio: %.2f -> %.2f)",
            item_name, abc_class or "?", raw_forecast, calibrated, ratio, calibrated / historical_avg
        )
        return calibrated
    
    # Если прогноз слишком пессимистичный (падение больше чем min_ratio)
    elif ratio < min_ratio:
        # Поднимаем до минимального уровня
        calibrated = max(raw_forecast, min_ratio * historical_avg)
        
        if calibrated != raw_forecast:
            logger.info(
                "Калибровка пессимистичного прогноза для '%s' (ABC:%s): %.1f -> %.1f (ratio: %.2f -> %.2f)",
                item_name, abc_class or "?", raw_forecast, calibrated, ratio, calibrated / historical_avg
            )
        return calibrated
    
    # Прогноз в разумных пределах - оставляем как есть
    return raw_forecast


# ============================================================
# Предсказание одной даты
# ============================================================
def _predict_daily(feats: Dict[str, Any]) -> float:
    df_feats = pd.DataFrame([feats], columns=FEATURE_COLS)
    raw = model.predict(df_feats)  # лог-скейл (т.к. обучали на log1p)
    daily = float(np.expm1(raw)[0])
    return max(daily, 0.0)


# ============================================================
# Прогноз на период с floor + (опц.) bias
# ============================================================
def _predict_period_total(
    item_name: str,
    item_code: Optional[str],
    start_date: pd.Timestamp,
    days: int,
) -> int:
    """Суммарный прогноз на период.

    1) Базовый прогноз: суммируем дневные предсказания CatBoost (меняем календарь).
    2) Floor: не ниже среднего факта за последние FLOOR_LOOKBACK_DAYS * FLOOR_COEF.
    3) Bias (опционально): умножение на SKU-бейас, если включено.
    4) Fallback: если всё равно <1, берём средний дневной факт * days (за то же окно) или 1/день.
    """

    # --- 1. базовые признаки по стартовой дате
    base_feats = get_item_features(item_name, item_code, start_date)
    base_total = 0.0

    for d in range(days):
        cur = start_date + timedelta(days=d)
        f = base_feats.copy()
        f["Месяц"]      = int(cur.month)
        f["ДеньМесяца"] = int(cur.day)
        f["ДеньНедели"] = int(cur.weekday())
        f["Квартал"]    = int((cur.month - 1) // 3 + 1)
        f["IsWeekend"]  = int(cur.weekday() in [5, 6])
        daily = _predict_daily(f)
        base_total += daily

    # --- 2. Калибровка для сглаживания агрессивных прогнозов
    hist_avg = _recent_hist_daily(item_name, item_code, start_date, FLOOR_LOOKBACK_DAYS)
    historical_period_avg = hist_avg * days if hist_avg is not None else None
    abc_class = _abc_lookup.get(item_name)
    
    # Применяем калибровку к сырому прогнозу
    calibrated_total = _apply_calibration(
        raw_forecast=base_total,
        historical_avg=historical_period_avg,
        item_name=item_name,
        abc_class=abc_class
    )
    
    # --- 3. floor по факту (до start_date)
    floor_total = hist_avg * FLOOR_COEF * days if hist_avg is not None else 0.0
    adj_total = max(calibrated_total, floor_total)

    # --- 4. bias корректировка (если включено)
    if APPLY_BIAS:
        bias = _sku_bias_lookup.get(item_name, 1.0)
        adj_total *= bias

    # --- 5. fallback если совсем мало
    if adj_total < 1:
        if hist_avg is not None:
            adj_total = hist_avg * days
        else:
            adj_total = days  # 1 шт/день

    return int(round(adj_total))


# ============================================================
# /forecast  (старый формат: список объектов)
# ============================================================
@app.post("/forecast")
async def forecast(payload: ForecastPayload = Body(...)):
    try:
        header = None
        sales_events: List[SaleEvent] = []
        supply_events: List[SupplyEvent] = []

        for obj in payload:
            if isinstance(obj, DaysHeader):
                header = obj
            elif isinstance(obj, SaleEvent) or (hasattr(obj, "Type") and getattr(obj, "Type") == "Продажа"):
                sales_events.append(obj if isinstance(obj, SaleEvent) else SaleEvent(**obj.dict()))
            elif isinstance(obj, SupplyEvent) or (hasattr(obj, "Type") and getattr(obj, "Type") == "Поставка"):
                supply_events.append(obj if isinstance(obj, SupplyEvent) else SupplyEvent(**obj.dict()))

        if header is None:
            raise HTTPException(status_code=400, detail="Не найден DaysCount.")
        if not sales_events:
            raise HTTPException(status_code=400, detail="Не найдено продаж.")

        days = header.DaysCount
        results: List[Dict[str, Any]] = []

        # summary-глобальные метрики
        results.append(MetricResponse(
            MAPE=_global_mape(),
            MAE=_global_mae(),
            DaysPredict=days
        ).dict())

        for sale in sales_events:
            start_date = pd.to_datetime(sale.Период)
            end_date   = start_date + timedelta(days=days - 1)
            qty        = _predict_period_total(sale.Номенклатура, sale.Код, start_date, days)
            safety, reco = _safety_and_order(sale.Номенклатура, sale.Код, days, event_obj=sale, forecast_qty=qty)
            mape, mae  = get_item_metrics(sale.Номенклатура, sale.Код)
            curr_stock = (
                sale.Остаток_в_магазине
                if sale.Остаток_в_магазине is not None
                else _stock_est_lookup.get(sale.Номенклатура)
            )
            results.append(DetailResponse(
                Период=f"{start_date:%Y-%m-%d} - {end_date:%Y-%m-%d}",
                #Номенклатура=f"{sale.Номенклатура} ({_abc_lookup.get(sale.Номенклатура, '')})",
                Номенклатура=sale.Номенклатура,
                ABC_Class=_abc_lookup.get(sale.Номенклатура, None),
                Код=sale.Код or "unknown",
                MAPE=mape,
                MAE=mae,
                Количество=qty,
                SafetyStock=safety,
                RecommendedOrder=reco,
                CurrentStock=curr_stock,
            ).dict())

        return results

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("/forecast error: %s", e)
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера.")


# ============================================================
# Новый формат /predict {DaysCount, events:[...]}
# ============================================================
class ForecastPayloadNew(BaseModel):
    DaysCount: int
    events: List[Union[SaleEvent, SupplyEvent]]


@app.post("/predict")
async def predict(payload: ForecastPayloadNew):
    try:
        days = payload.DaysCount
        results: List[Dict[str, Any]] = []

        # summary
        results.append({
            "MAPE": round(_global_mape(), 1),
            "MAE": round(_global_mae(), 2),
            "DaysPredict": days
        })

        for ev in payload.events:
            if isinstance(ev, SupplyEvent):
                # пока игнорируем поставки в ответе (можно расширить позже)
                continue

            if isinstance(ev, SaleEvent):
                start_date = pd.to_datetime(ev.Период)
                end_date   = start_date + timedelta(days=days - 1)
                qty        = _predict_period_total(ev.Номенклатура, ev.Код, start_date, days)
                safety, reco = _safety_and_order(ev.Номенклатура, ev.Код, days, event_obj=ev, forecast_qty=qty)
                mape, mae  = get_item_metrics(ev.Номенклатура, ev.Код)
                curr_stock = (
                    ev.Остаток_в_магазине
                    if ev.Остаток_в_магазине is not None
                    else _stock_est_lookup.get(ev.Номенклатура)
                )

                results.append({
                    "Период": f"{start_date:%Y-%m-%d} - {end_date:%Y-%m-%d}",
                    #"Номенклатура": f"{ev.Номенклатура} ({_abc_lookup.get(ev.Номенклатура, '')})",
                    "Номенклатура": ev.Номенклатура,
                    "ABC_Class": _abc_lookup.get(ev.Номенклатура, None),
                    "Код": ev.Код or "unknown",
                    "MAPE": round(mape, 1),
                    "MAE": round(mae, 2),
                    "Количество": int(qty),
                    "SafetyStock": int(safety),
                    "RecommendedOrder": int(reco),
                    "CurrentStock": curr_stock,
                })

        return results

    except Exception as e:
        logger.exception("/predict error: %s", e)
        raise HTTPException(status_code=500, detail="Ошибка прогнозирования.")

# === ДОБАВИМ ВЕРСИЮ /export_retro_csv с улучшениями ===

@app.get("/export_retro_csv")
async def export_retro_csv(
    days: int = 30,
    start: str = "2025-06-14",
    filename: str = "retro.csv"
):
    global historical_data  # обязательно для временной подмены истории
    try:
        start_date = pd.to_datetime(start)
        end_date = start_date + timedelta(days=days - 1)
        result_rows = []

        for item in historical_data["Номенклатура"].unique():
            item_data = historical_data[historical_data["Номенклатура"] == item]
            if item_data.empty:
                continue
            code = item_data["Код"].iloc[-1]

            # --- история до периода (имитация прошлого)
            past_data = item_data[item_data["Дата"] < start_date]
            if past_data.empty:
                continue

            # --- остаток на момент старта периода
            last_stock_row = past_data.sort_values("Дата").iloc[-1]
            if last_stock_row.get("Stock", 0) <= 0:
                continue

            # --- факт за период
            future_data = item_data[
                (item_data["Дата"] >= start_date) &
                (item_data["Дата"] <= end_date)
            ]
            if future_data.empty:
                continue

            fact_total = future_data["TotalQuantity"].sum()
            actual_order = future_data["SupplyQty"].sum()

            # --- временно ограничим историю "как бы" из прошлого
            historical_data_orig = historical_data.copy()
            historical_data = historical_data[historical_data["Дата"] < start_date].copy()

            # --- отключаем floor для честной оценки
            pred_total = _predict_period_total(item, code, start_date, days, use_floor=False)
            safety, reco = _safety_and_order(item, code, days, forecast_qty=pred_total)

            # --- восстановим
            historical_data = historical_data_orig

            # --- логгируем сильные расхождения
            abs_diff = abs(pred_total - fact_total)
            if abs_diff >= 30:
                logger.warning("SKU %s: прогн.=%d факт=%d заказ=%d", item, pred_total, fact_total, actual_order)

            result_rows.append({
                "Номенклатура": item,
                "Код": code,
                "Период": f"{start_date:%Y-%m-%d} - {end_date:%Y-%m-%d}",
                "ФактПродаж": round(fact_total),
                "Предсказание": pred_total,
                "ОшибкаПрогноза": round(pred_total - fact_total),
                "Фактический заказ": round(actual_order),
                "Предсказанный заказ": reco,
                "SafetyStock": safety
            })

        df_result = pd.DataFrame(result_rows)
        df_result.to_csv(filename, index=False)
        logger.info("✅ Ретро-CSV сохранён: %s", filename)
        return {"status": "success", "file": filename, "records": len(df_result)}

    except Exception as e:
        logger.exception("Ошибка экспорта ретро csv: %s", e)
        raise HTTPException(status_code=500, detail="Ошибка ретро экспорта")


# === ОБНОВИМ _predict_period_total() с флагом use_floor ===
def _predict_period_total(
    item_name: str,
    item_code: Optional[str],
    start_date: pd.Timestamp,
    days: int,
    use_floor: bool = True
) -> int:
    """Версия с флагом use_floor для ретро-анализа."""
    base_feats = get_item_features(item_name, item_code, start_date)
    base_total = 0.0

    for d in range(days):
        cur = start_date + timedelta(days=d)
        f = base_feats.copy()
        f["Месяц"] = cur.month
        f["ДеньМесяца"] = cur.day
        f["ДеньНедели"] = cur.weekday()
        f["Квартал"] = (cur.month - 1) // 3 + 1
        f["IsWeekend"] = int(cur.weekday() in [5, 6])
        daily = _predict_daily(f)
        base_total += daily

    # Калибровка (если включена)
    hist_avg = _recent_hist_daily(item_name, item_code, start_date, FLOOR_LOOKBACK_DAYS)
    historical_period_avg = hist_avg * days if hist_avg is not None else None
    abc_class = _abc_lookup.get(item_name)
    
    calibrated_total = _apply_calibration(
        raw_forecast=base_total,
        historical_avg=historical_period_avg,
        item_name=item_name,
        abc_class=abc_class
    )
    
    # Floor (если включён)
    if use_floor and hist_avg is not None:
        floor_total = hist_avg * FLOOR_COEF * days
        adj_total = max(calibrated_total, floor_total)
    else:
        adj_total = calibrated_total

    # Bias (если включён)
    if APPLY_BIAS:
        bias = _sku_bias_lookup.get(item_name, 1.0)
        adj_total *= bias

    # Fallback
    if adj_total < 1:
        adj_total = hist_avg * days if hist_avg is not None else days

    return int(round(adj_total))


# ============================================================
# Сервисные эндпойнты
# ============================================================
@app.get("/")
async def root():
    return {
        "message": "Sales Prediction API",
        "version": "1.2.0",
        "endpoints": [
            "/forecast", 
            "/predict", 
            "/health", 
            "/metrics", 
            "/calibration", 
            "/export_retro_csv"
        ],
        "new_features": [
            "Калибровка для сглаживания агрессивных прогнозов",
            "Разные стратегии калибровки по ABC-классам",
            "Управление параметрами калибровки через API",
            "Экспорт ретроспективного анализа в CSV"
        ]
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": model is not None,
        "items_count": len(item_metrics)
    }


@app.get("/metrics")
async def get_metrics():
    return {
        "total_items": len(item_metrics),
        "avg_mape": _global_mape(),
        "avg_mae": _global_mae()
    }


@app.get("/calibration")
async def get_calibration_settings():
    """Получить текущие настройки калибровки."""
    return {
        "calibration_enabled": CALIBRATION_ENABLED,
        "calibration_alpha": CALIBRATION_ALPHA,
        "calibration_max_ratio": CALIBRATION_MAX_RATIO,
        "calibration_min_ratio": CALIBRATION_MIN_RATIO,
        "floor_coef": FLOOR_COEF,
        "floor_lookback_days": FLOOR_LOOKBACK_DAYS,
        "apply_bias": APPLY_BIAS,
        "description": {
            "calibration_enabled": "Включена ли калибровка для сглаживания агрессивных прогнозов",
            "calibration_alpha": "Вес исторических данных при калибровке (0-1)",
            "calibration_max_ratio": "Максимальный рост прогноза относительно истории",
            "calibration_min_ratio": "Минимальное падение прогноза относительно истории",
            "floor_coef": "Коэффициент для floor-корректировки",
            "floor_lookback_days": "Количество дней для расчета floor",
            "apply_bias": "Применять ли bias-корректировку"
        }
    }


@app.post("/calibration")
async def update_calibration_settings(
    calibration_enabled: Optional[bool] = None,
    calibration_alpha: Optional[float] = None,
    calibration_max_ratio: Optional[float] = None,
    calibration_min_ratio: Optional[float] = None
):
    """Обновить настройки калибровки (временно, до перезапуска)."""
    global CALIBRATION_ENABLED, CALIBRATION_ALPHA, CALIBRATION_MAX_RATIO, CALIBRATION_MIN_RATIO
    
    old_settings = {
        "calibration_enabled": CALIBRATION_ENABLED,
        "calibration_alpha": CALIBRATION_ALPHA,
        "calibration_max_ratio": CALIBRATION_MAX_RATIO,
        "calibration_min_ratio": CALIBRATION_MIN_RATIO
    }
    
    if calibration_enabled is not None:
        CALIBRATION_ENABLED = calibration_enabled
    if calibration_alpha is not None:
        if 0 <= calibration_alpha <= 1:
            CALIBRATION_ALPHA = calibration_alpha
        else:
            raise HTTPException(status_code=400, detail="calibration_alpha должен быть от 0 до 1")
    if calibration_max_ratio is not None:
        if calibration_max_ratio > 1:
            CALIBRATION_MAX_RATIO = calibration_max_ratio
        else:
            raise HTTPException(status_code=400, detail="calibration_max_ratio должен быть больше 1")
    if calibration_min_ratio is not None:
        if 0 < calibration_min_ratio < 1:
            CALIBRATION_MIN_RATIO = calibration_min_ratio
        else:
            raise HTTPException(status_code=400, detail="calibration_min_ratio должен быть от 0 до 1")
    
    new_settings = {
        "calibration_enabled": CALIBRATION_ENABLED,
        "calibration_alpha": CALIBRATION_ALPHA,
        "calibration_max_ratio": CALIBRATION_MAX_RATIO,
        "calibration_min_ratio": CALIBRATION_MIN_RATIO
    }
    
    logger.info("Обновлены настройки калибровки: %s -> %s", old_settings, new_settings)
    
    return {
        "status": "success",
        "message": "Настройки калибровки обновлены (до перезапуска)",
        "old_settings": old_settings,
        "new_settings": new_settings
    }


# ------------------------------------------------------------
# Локальный запуск
# ------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
