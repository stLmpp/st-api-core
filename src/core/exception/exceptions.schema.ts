import { z } from 'zod';

export const ExceptionSchema = z.object({
  status: z.number().min(400).max(599),
  message: z.string().min(1),
  error: z.string(),
  errorCode: z.string().min(4),
  correlationId: z.string(),
  traceId: z.string(),
});
