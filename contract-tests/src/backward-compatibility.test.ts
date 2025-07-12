import Joi from 'joi';
import { 
  loginRequestSchema,
  loginResponseSchema,
  forecastRequestSchema,
  forecastResponseSchema
} from './schemas/backend-api.schema';

describe('API Backward Compatibility Tests', () => {
  describe('Login API Compatibility', () => {
    test('should accept old login request format', () => {
      // Old format might not have had strict email validation
      const oldRequestFormat = {
        email: 'user@domain',  // Missing TLD
        password: '12345'      // Less than 6 characters
      };

      // Create a backward compatible schema
      const backwardCompatibleLoginSchema = Joi.object({
        email: Joi.string().required(), // Less strict for backward compatibility
        password: Joi.string().required() // No minimum length
      });

      const { error } = backwardCompatibleLoginSchema.validate(oldRequestFormat);
      expect(error).toBeUndefined();
    });

    test('should provide new fields in response while maintaining old ones', () => {
      const oldResponseFields = {
        token: 'jwt-token',
        user: {
          id: 'user-123',
          email: 'user@example.com'
        }
      };

      const newResponseFields = {
        ...oldResponseFields,
        user: {
          ...oldResponseFields.user,
          role: 'user', // New field
          createdAt: '2024-01-01T00:00:00Z', // New field
          lastLogin: '2024-01-15T00:00:00Z'  // New field
        },
        expiresIn: 3600 // New field
      };

      // Extended schema that's backward compatible
      const extendedLoginResponseSchema = loginResponseSchema.keys({
        expiresIn: Joi.number().optional(),
        user: Joi.object({
          id: Joi.string().required(),
          email: Joi.string().email().required(),
          role: Joi.string().valid('admin', 'user', 'manager').required(),
          createdAt: Joi.date().iso().optional(),
          lastLogin: Joi.date().iso().optional()
        }).required()
      });

      const { error } = extendedLoginResponseSchema.validate(newResponseFields);
      expect(error).toBeUndefined();
    });
  });

  describe('Forecast API Compatibility', () => {
    test('should accept old forecast request format', () => {
      // Old format might have used different date format
      const oldRequestFormat = {
        startDate: '2024-01-01', // Not ISO format
        endDate: '2024-01-31',   // Not ISO format
        products: ['product-1']
        // storeId was not in old version
      };

      // Backward compatible schema
      const backwardCompatibleForecastSchema = Joi.object({
        startDate: Joi.alternatives().try(
          Joi.date().iso(),
          Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/)
        ).required(),
        endDate: Joi.alternatives().try(
          Joi.date().iso(),
          Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/)
        ).required(),
        products: Joi.array().items(Joi.string()).min(1).required(),
        storeId: Joi.number().integer().positive().optional()
      });

      const { error } = backwardCompatibleForecastSchema.validate(oldRequestFormat);
      expect(error).toBeUndefined();
    });

    test('should handle deprecated fields gracefully', () => {
      const requestWithDeprecatedFields = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T00:00:00Z',
        products: ['product-1'],
        // Deprecated fields
        includeConfidence: true,  // Deprecated, always included now
        format: 'json'           // Deprecated, always JSON now
      };

      const schemaWithDeprecatedFields = forecastRequestSchema.keys({
        includeConfidence: Joi.boolean().optional(),
        format: Joi.string().valid('json', 'xml').optional()
      });

      const { error, value } = schemaWithDeprecatedFields.validate(
        requestWithDeprecatedFields,
        { stripUnknown: false }
      );

      expect(error).toBeUndefined();
      expect(value).toHaveProperty('includeConfidence');
      expect(value).toHaveProperty('format');
    });
  });

  describe('Schema Evolution Tests', () => {
    test('should validate schema version compatibility', () => {
      const v1Schema = Joi.object({
        version: Joi.string().default('1.0.0'),
        data: Joi.object({
          id: Joi.string().required(),
          name: Joi.string().required()
        })
      });

      const v2Schema = Joi.object({
        version: Joi.string().default('2.0.0'),
        data: Joi.object({
          id: Joi.string().required(),
          name: Joi.string().required(),
          description: Joi.string().optional() // New optional field
        })
      });

      // V1 data should be valid in V2 schema
      const v1Data = {
        version: '1.0.0',
        data: {
          id: '123',
          name: 'Test'
        }
      };

      const { error: v1Error } = v1Schema.validate(v1Data);
      const { error: v2Error } = v2Schema.validate(v1Data);

      expect(v1Error).toBeUndefined();
      expect(v2Error).toBeUndefined(); // Backward compatible
    });

    test('should handle field renaming with aliases', () => {
      // Schema with renamed field but supporting old name
      const schemaWithAlias = Joi.object({
        productId: Joi.string().required(),
        productName: Joi.string().required(),
        itemCount: Joi.number().required() // New name
      }).rename('quantity', 'itemCount'); // Support old name

      const oldFormat = {
        productId: 'P001',
        productName: 'Product 1',
        quantity: 10 // Old field name
      };

      const newFormat = {
        productId: 'P001',
        productName: 'Product 1',
        itemCount: 10 // New field name
      };

      const { error: oldError, value: oldValue } = schemaWithAlias.validate(oldFormat);
      const { error: newError } = schemaWithAlias.validate(newFormat);

      expect(oldError).toBeUndefined();
      expect(oldValue.itemCount).toBe(10); // Renamed
      expect(newError).toBeUndefined();
    });
  });
});
