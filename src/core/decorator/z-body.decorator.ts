import { ZodType } from 'zod/v4';

const ZBodyMetadataSymbol = Symbol('ZBodyMetadata');

export interface ZBodyMetadata {
  schema: ZodType | undefined;
  parameterIndex: number;
}

interface ZBody {
  (schema?: ZodType): ParameterDecorator;
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

function Decorator(schema?: ZodType): ParameterDecorator {
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
