# Frontend: Sales Forecast Page

## Структура и архитектура

- **Интерфейсы и типы**: Все типы данных для страницы прогноза вынесены в файл [`src/pages/types.ts`](src/pages/types.ts). Здесь описаны:
  - `TopProduct` — топовые продукты
  - `TrendPoint` — точка тренда продаж
  - `ForecastHistoryItem` — запись истории прогнозов
  - `ForecastApiResponse` — структура ответа API

- **Бизнес-логика**: Вся логика работы с API и состоянием реализована в компоненте [`src/pages/SalesForecastPage.tsx`](src/pages/SalesForecastPage.tsx):
  - Загрузка тренда, топ-продуктов и истории через хуки (`useEffect`, `useState`)
  - POST-запрос для обновления прогноза
  - Пагинация, фильтрация, обработка ошибок, отображение лоадеров

- **Работа с API**: Вынесена в [`src/api/forecast.ts`](src/api/forecast.ts):
  - `fetchForecastData(days)` — получить тренд и топ-продукты
  - `postForecast()` — запросить новый прогноз
  - `fetchForecastHistory(page, limit, search, category)` — получить историю с пагинацией и фильтрами

## Быстрый старт для коллег

1. Все типы и интерфейсы — в `src/pages/types.ts`
2. Вся бизнес-логика страницы — в `src/pages/SalesForecastPage.tsx`
3. Вся работа с API — в `src/api/forecast.ts`
4. Для подключения к реальному API — замените заглушки в `forecast.ts` на реальные эндпоинты

## Документация по функциям и интерфейсам

JSDoc-комментарии добавлены к основным функциям и типам (см. исходники файлов).

---

- Для вопросов и доработок: пишите в комментариях к коду или в этот README.
