import { generateSchema as zodOpenapiGenerateSchema } from '@st-api/zod-openapi';
import { ZodSchema } from 'zod';

export function generateSchema(schema: ZodSchema, useOutput = false): any {
  return zodOpenapiGenerateSchema(schema, useOutput);
}
