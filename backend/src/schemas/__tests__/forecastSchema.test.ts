import { forecastInputSchema } from '../forecastSchema';

describe('forecastSchema', () => {
  describe('forecastInputSchema', () => {
    it('должен принимать валидный DaysCount', () => {
      const validInputs = [
        { DaysCount: 1 },
        { DaysCount: 7 },
        { DaysCount: 30 },
        { DaysCount: 365 },
      ];

      validInputs.forEach(input => {
        const result = forecastInputSchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(input);
        }
      });
    });

    it('должен использовать значение по умолчанию если DaysCount не указан', () => {
      const result = forecastInputSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.DaysCount).toBe(7);
      }
    });

    it('должен отклонять невалидные значения DaysCount', () => {
      const invalidInputs = [
        { DaysCount: 0 },        // меньше минимума
        { DaysCount: -1 },       // отрицательное
        { DaysCount: 366 },      // больше максимума
        { DaysCount: 1.5 },      // не целое число
        { DaysCount: 'seven' },  // не число
        { DaysCount: null },     // null
      ];

      invalidInputs.forEach(input => {
        const result = forecastInputSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.length).toBeGreaterThan(0);
        }
      });
    });

    it('должен игнорировать лишние поля', () => {
      const input = {
        DaysCount: 14,
        extraField: 'should be ignored',
        anotherField: 123,
      };

      const result = forecastInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ DaysCount: 14 });
        expect('extraField' in result.data).toBe(false);
        expect('anotherField' in result.data).toBe(false);
      }
    });

    it('должен предоставлять понятные сообщения об ошибках', () => {
      const testCases = [
        {
          input: { DaysCount: 'not a number' },
          expectedError: 'Expected number, received string',
        },
        {
          input: { DaysCount: 0 },
          expectedError: 'Number must be greater than or equal to 1',
        },
        {
          input: { DaysCount: 1000 },
          expectedError: 'Number must be less than or equal to 365',
        },
        {
          input: { DaysCount: 3.14 },
          expectedError: 'Expected integer, received float',
        },
      ];

      testCases.forEach(({ input, expectedError }) => {
        const result = forecastInputSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          const errorMessage = result.error.errors[0].message;
          expect(errorMessage).toContain(expectedError);
        }
      });
    });
  });
});
