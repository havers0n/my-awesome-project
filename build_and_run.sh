#!/bin/bash
set -e

# Собрать контейнеры
docker compose build

# Запустить контейнеры
docker compose up -d 