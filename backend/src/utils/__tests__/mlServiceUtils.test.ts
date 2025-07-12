import { formatMLResponse, validateMLResponse, transformMLPayload } from '../mlServiceUtils';

describe('ML Service Utils', () => {
  describe('formatMLResponse', () => {
    it('should format valid ML response', () => {
      const mlResponse = [
        { MAPE: '5.2%', MAE: 2.1, DaysPredict: 7 },
        { product_id: 'prod-1', quantity: 100, MAPE: '3.5%', MAE: 1.2 }
      ];

      const formatted = formatMLResponse(mlResponse);

      expect(formatted).toEqual({
        metrics: {
          MAPE: 5.2,
          MAE: 2.1,
          DaysPredict: 7
        },
        predictions: [
          {
            product_id: 'prod-1',
            quantity: 100,
            item_mape: 3.5,
            item_mae: 1.2
          }
        ]
      });
    });

    it('should handle empty response', () => {
      const formatted = formatMLResponse([]);

      expect(formatted).toEqual({
        metrics: {
          MAPE: 0,
          MAE: 0,
          DaysPredict: 0
        },
        predictions: []
      });
    });

    it('should handle response without metrics', () => {
      const mlResponse = [
        { product_id: 'prod-1', quantity: 50 }
      ];

      const formatted = formatMLResponse(mlResponse);

      expect(formatted).toEqual({
        metrics: {
          MAPE: 0,
          MAE: 0,
          DaysPredict: 0
        },
        predictions: [
          {
            product_id: 'prod-1',
            quantity: 50,
            item_mape: 0,
            item_mae: 0
          }
        ]
      });
    });
  });

  describe('validateMLResponse', () => {
    it('should validate correct ML response', () => {
      const response = [
        { MAPE: '5%', MAE: 2, DaysPredict: 7 },
        { product_id: 'prod-1', quantity: 100 }
      ];

      const result = validateMLResponse(response);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-array response', () => {
      const result = validateMLResponse({});

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Response must be an array');
    });

    it('should reject empty response', () => {
      const result = validateMLResponse([]);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Response cannot be empty');
    });

    it('should reject response without metrics', () => {
      const response = [
        { product_id: 'prod-1', quantity: 100 }
      ];

      const result = validateMLResponse(response);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('First element must contain metrics (MAPE, MAE, DaysPredict)');
    });
  });

  describe('transformMLPayload', () => {
    it('should transform operations to ML format', () => {
      const operations = [
        {
          product_id: 'prod-1',
          operation_type: 'sale',
          quantity: 10,
          operation_date: '2024-01-01',
          cost_price: 100
        }
      ];

      const transformed = transformMLPayload(operations, 7);

      expect(transformed).toEqual({
        DaysCount: 7,
        events: [
          {
            Type: 'Продажа',
            Период: '2024-01-01',
            Номенклатура: 'prod-1',
            Код: 'prod-1',
            Количество: 10,
            Цена: 100
          }
        ]
      });
    });

    it('should handle supply operations', () => {
      const operations = [
        {
          product_id: 'prod-2',
          operation_type: 'supply',
          quantity: 50,
          operation_date: '2024-01-02',
          cost_price: 200
        }
      ];

      const transformed = transformMLPayload(operations, 14);

      expect(transformed.events[0].Type).toBe('Поставка');
    });

    it('should use default price when cost_price is null', () => {
      const operations = [
        {
          product_id: 'prod-3',
          operation_type: 'sale',
          quantity: 5,
          operation_date: '2024-01-03',
          cost_price: null
        }
      ];

      const transformed = transformMLPayload(operations, 7);

      expect(transformed.events[0].Цена).toBe(100.0);
    });
  });
});
