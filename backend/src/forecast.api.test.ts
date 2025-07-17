import request from 'supertest';
import nock from 'nock';
import app from './app';
import { forecastInputSchema } from './schemas/forecastSchema';

// Пример запроса и ответа из jsnonexample.md
const validPayload = [
  { DaysCount: 5 },
  {
    Type: 'Продажа',
    Период: '2025-06-01',
    Номенклатура: 'Молоко 2.5%',
    Количество: 25,
    Код: '000123',
    'ВидНоменклатуры': 'Молочные продукты',
    'Поставщик': 'ООО МолПродукт',
    'Производитель': 'Молочный Комбинат №1',
    'Вес': 1.0,
    'Артикул': 'MLK025',
    'Группа': 'Молочка',
    'Сумма': 1875.0,
    'Срок годности (час)': 168,
    'Наличие товара': true,
    'Наличие товара в магазине': true,
    'Категория товара': 'Премиум',
    'Задержка поставки (дн)': 0,
    'Адрес точки': 'г. Москва, ул. Ленина, 12',
    'Заканчивался ли продукт': false,
    'Цена на полке': 75.0,
    'Часов работала точка': 12,
    'Остаток в магазине': 10,
    'Цена': 100,
  }
];

const mlResponse = [
  { MAPE: 10, MAE: 0.5, DaysPredict: 5 },
  {
    Период: '2025-06-01 - 2025-06-05',
    Номенклатура: 'Молоко 2.5%',
    Код: '000123',
    MAPE: 10,
    MAE: 0.5,
    Количество: 5,
  }
];

describe('POST /api/forecast', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('validates input and proxies to ML, stores and returns canonical JSON', async () => {
    nock('http://localhost:5000')
      .post('/predict')
      .reply(200, mlResponse);

    const res = await request(app)
      .post('/api/forecast')
      .send(validPayload)
      .set('Authorization', 'Bearer testtoken');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mlResponse);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('MAPE');
    expect(res.body[1]).toHaveProperty('Номенклатура');
  });

  it('returns 400 on invalid input', async () => {
    const invalidPayload = [{ Type: 'Продажа', Количество: 'нет числа' }]; // missing required fields
    const res = await request(app)
      .post('/api/forecast')
      .send(invalidPayload)
      .set('Authorization', 'Bearer testtoken');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 if authorization header is missing', async () => {
    const res = await request(app)
      .post('/api/forecast')
      .send(validPayload);
    expect(res.status).toBe(401);
  });

  it('returns 502 if ML service errors', async () => {
    nock('http://localhost:5000').post('/predict').reply(500, {error: 'upstream fail'});
    const res = await request(app)
      .post('/api/forecast')
      .send(validPayload)
      .set('Authorization', 'Bearer testtoken');
    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('error');
  });
});

