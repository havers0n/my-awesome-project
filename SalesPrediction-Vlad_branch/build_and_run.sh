#!/bin/bash
set -e

#Открываю первую папку с первым моим проектом
cd microservice/
#Собираю докер
sudo docker build -t salesprediction-sales-forecast-service .
#Запускаю докер и не забываю добавить --label branch=Alex_branch, потому что эти контейнеры принадлежат мне
sudo docker run --label branch=Vlad_branch --restart unless-stopped -d -p 8002:8002 --name salesprediction-sales-forecast-service salesprediction-sales-forecast-service

#8005,5000,5111 - это порты на которых работают контейнеры, я их открыл для всех. 
#--restart unless-stopped Делает так чтобы контейнер не умер от перезагрузки сервера