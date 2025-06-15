import { ZodTypeAny } from 'zod';

const ZBodyMetadataSymbol = Symbol('ZBodyMetadata');

export interface ZBodyMetadata {
  schema: ZodTypeAny | undefined;
  parameterIndex: number;
}

interface ZBody {
  (schema?: ZodTypeAny): ParameterDecorator;
  getMetadata(
    target: any,
    propertyKey: string | symbol | undefined,
  ): ZBodyMetadata | undefined;
  setMetadata(
    target: any,
    propertyKey: string | symbol | undefined,
    metadata: ZBodyMetadata,
  ): void;
}

const getMetadata: ZBody['getMetadata'] = (target, propertyKey) =>
  Reflect.getMetadata(ZBodyMetadataSymbol, target, propertyKey ?? '');
const setMetadata: ZBody['setMetadata'] = (target, propertyKey, metadata) => {
  Reflect.defineMetadata(
    ZBodyMetadataSymbol,
    metadata,
    target,
    propertyKey ?? '',
  );
};

function Decorator(schema?: ZodTypeAny): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    setMetadata(target.constructor, propertyKey, {
      schema,
      parameterIndex,
    });
  };
}

export const ZBody: ZBody = Object.assign(Decorator, {
  getMetadata,
  setMetadata,
});
