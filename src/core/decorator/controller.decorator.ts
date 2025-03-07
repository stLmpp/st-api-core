import { Injectable } from '@stlmpp/di';
import { OperationObject } from 'openapi3-ts/oas30';

export type MethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ControllerOptions {
  path?: string;
  method?: MethodType;
  openapi?: Partial<OperationObject>;
}

const ControllerMetadataSymbol = Symbol('ControllerMetadata');

interface Controller {
  (options?: ControllerOptions): ClassDecorator;
  getMetadata(target: any): ControllerOptions | undefined;
  setMetadata(target: any, options?: ControllerOptions): void;
}

const getMetadata: Controller['getMetadata'] = (target) =>
  Reflect.getMetadata(ControllerMetadataSymbol, target);
const setMetadata: Controller['setMetadata'] = (target, options) => {
  Reflect.defineMetadata(ControllerMetadataSymbol, options ?? {}, target);
};

function ControllerDecorator(options?: ControllerOptions): ClassDecorator {
  return (target) => {
    setMetadata(target, options);
    Injectable()(target);
  };
}

export const Controller: Controller = Object.assign(ControllerDecorator, {
  getMetadata,
  setMetadata,
});
