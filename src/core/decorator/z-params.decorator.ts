import { ZodObject, ZodTypeAny } from 'zod';

const ZParamsMetadataSymbol = Symbol('ZParamsMetadata');

export interface ZParamsMetadata {
  schema: ZodObject<Record<string, ZodTypeAny>> | undefined;
  parameterIndex: number;
}

interface ZParams {
  (schema?: ZodTypeAny): ParameterDecorator;
  getMetadata(
    target: any,
    propertyKey: string | symbol | undefined,
  ): ZParamsMetadata | undefined;
  setMetadata(
    target: any,
    propertyKey: string | symbol | undefined,
    metadata: ZParamsMetadata,
  ): void;
}

const getMetadata: ZParams['getMetadata'] = (target, propertyKey) =>
  Reflect.getMetadata(ZParamsMetadataSymbol, target, propertyKey ?? '');
const setMetadata: ZParams['setMetadata'] = (target, propertyKey, metadata) => {
  Reflect.defineMetadata(
    ZParamsMetadataSymbol,
    metadata,
    target,
    propertyKey ?? '',
  );
};

function Decorator(schema?: ZodTypeAny): ParameterDecorator {
  const isValidSchema = schema instanceof ZodObject;
  if (schema && !isValidSchema) {
    throw new TypeError('ZParams decorator only support ZodObject as schema');
  }
  return (target, propertyKey, parameterIndex) => {
    setMetadata(target.constructor, propertyKey, {
      schema,
      parameterIndex,
    });
  };
}

export const ZParams: ZParams = Object.assign(Decorator, {
  getMetadata,
  setMetadata,
});
