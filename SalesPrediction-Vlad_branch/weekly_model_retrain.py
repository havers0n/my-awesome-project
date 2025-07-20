"""
Пример DAG для автоматического переобучения модели прогнозирования продаж

ВНИМАНИЕ: Это не готовый код, а пример того, как примерно будет выглядеть DAG.
Требуется дополнительная разработка и реализация функций fetch_new_data, preprocess, retrain_model.
"""

from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
from scripts.fetch_data import fetch_new_data
from scripts.preprocess import preprocess
from scripts.train_model import retrain_model

default_args = {
    'start_date': datetime(2025, 7, 15),
    'retries': 1,
    'retry_delay': timedelta(minutes=3),
}

dag = DAG(
    'weekly_model_retrain',
    default_args=default_args,
    schedule_interval='@weekly',
    catchup=False
)

fetch = PythonOperator(
    task_id='fetch_data',
    python_callable=fetch_new_data,
    dag=dag
)

preprocess_task = PythonOperator(
    task_id='preprocess',
    python_callable=preprocess,
    dag=dag
)

train = PythonOperator(
    task_id='retrain_model',
    python_callable=retrain_model,
    dag=dag
)

fetch >> preprocess_task >> train
