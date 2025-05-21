import { z, ZodType } from 'zod/v4';
import { SchemaObject } from 'openapi3-ts/oas30';
import { OPENAPI_ZOD_KEY } from './openapi-zod-key.js';
import { mergeAndConcat } from 'merge-anything';

export function zodIsOptional(schema: ZodType): boolean {
  return !schema.safeParse(undefined).success;
}

export function zodToJSONSchema(schema: ZodType): SchemaObject {
  const jsonSchema = z.toJSONSchema(schema) as SchemaObject;
  const jsonSchemaMeta = schema.meta()?.[
    OPENAPI_ZOD_KEY
  ] as Partial<SchemaObject>;
  return mergeAndConcat(jsonSchema, jsonSchemaMeta);
}
