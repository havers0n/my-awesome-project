import { z } from 'zod';

// Schema for forecast API input - only expects DaysCount
export const forecastInputSchema = z.object({
  DaysCount: z.number().int().min(1).max(365).optional().default(7)
});

export type ForecastInput = z.infer<typeof forecastInputSchema>;
