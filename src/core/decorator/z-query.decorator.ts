import { ZodObject, ZodTypeAny } from 'zod';

const ZQueryMetadataSymbol = Symbol('ZQueryMetadata');

export interface ZQueryMetadata {
  schema: ZodObject<Record<string, ZodTypeAny>> | undefined;
  parameterIndex: number;
}

interface ZQuery {
  (schema?: ZodTypeAny): ParameterDecorator;
  getMetadata(
    target: any,
    propertyKey: string | symbol | undefined,
  ): ZQueryMetadata | undefined;
  setMetadata(
    target: any,
    propertyKey: string | symbol | undefined,
    metadata: ZQueryMetadata,
  ): void;
}

const getMetadata: ZQuery['getMetadata'] = (target, propertyKey) =>
  Reflect.getMetadata(ZQueryMetadataSymbol, target, propertyKey ?? '');
const setMetadata: ZQuery['setMetadata'] = (target, propertyKey, metadata) => {
  Reflect.defineMetadata(
    ZQueryMetadataSymbol,
    metadata,
    target,
    propertyKey ?? '',
  );
};

function Decorator(schema?: ZodTypeAny): ParameterDecorator {
  const isValidSchema = schema instanceof ZodObject;
  if (schema && !isValidSchema) {
    throw new TypeError('ZQuery decorator only support ZodObject as schema');
  }
  return (target, propertyKey, parameterIndex) => {
    setMetadata(target.constructor, propertyKey, {
      schema,
      parameterIndex,
    });
  };
}

export const ZQuery: ZQuery = Object.assign(Decorator, {
  getMetadata,
  setMetadata,
});
