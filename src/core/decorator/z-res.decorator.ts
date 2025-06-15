import { z, ZodTypeAny } from 'zod';
import { StatusCode } from 'hono/utils/http-status';

const ZResMetadataSymbol = Symbol('ZResMetadata');

export interface ZResMetadata {
  schema: ZodTypeAny;
  statusCode: StatusCode;
}

interface ZRes {
  (schema?: ZodTypeAny, status?: StatusCode): ClassDecorator;
  getMetadata(target: any): ZResMetadata | undefined;
  setMetadata(target: any, metadata: ZResMetadata): void;
}

const getMetadata: ZRes['getMetadata'] = (target) =>
  Reflect.getMetadata(ZResMetadataSymbol, target);
const setMetadata: ZRes['setMetadata'] = (target, metadata) => {
  Reflect.defineMetadata(ZResMetadataSymbol, metadata, target);
};

function Decorator(
  schema?: ZodTypeAny,
  status: StatusCode = 200,
): ClassDecorator {
  return (target: any) => {
    setMetadata(target, {
      schema: schema ?? z.void(),
      statusCode: status,
    });
  };
}

export const ZRes: ZRes = Object.assign(Decorator, {
  getMetadata,
  setMetadata,
});
