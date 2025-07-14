# API Endpoints

| Метод | Путь                                                        | Описание                                      | Аутентификация |
|-------|-------------------------------------------------------------|-----------------------------------------------|----------------|
| POST  | /reset-password                                            | Сброс пароля                                  | Нет            |
| GET   | /me                                                        | Получить профиль пользователя                 | Да             |
| GET   | /me/monetization                                           | Детали монетизации текущего пользователя      | Да             |
| GET   | /organizations/:organizationId/monetization                | Монетизация организации (для админа)          | Да             |
| PUT   | /monetization/subscription/:subscriptionId                 | Обновить настройки подписки                   | Да             |
| POST  | /monetization/subscription/:subscriptionId/cancel          | Отменить подписку                             | Да             |
| GET   | /monetization/savings                                      | Детали по проценту экономии                   | Да             |
| GET   | /monetization/pay-per-use                                  | Детали по оплате за использование             | Да             |

_Для расширенного описания и примеров см. контроллеры в backend/src/controllers/._ 