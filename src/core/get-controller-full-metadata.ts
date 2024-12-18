import { ZParams, ZParamsMetadata } from './decorator/z-params.decorator.js';
import { ZQuery, ZQueryMetadata } from './decorator/z-query.decorator.js';
import { ZHeaders, ZHeadersMetadata } from './decorator/z-headers.decorator.js';
import { ZBody, ZBodyMetadata } from './decorator/z-body.decorator.js';
import { ZRes, ZResMetadata } from './decorator/z-res.decorator.js';
import {
  Controller,
  ControllerOptions,
} from './decorator/controller.decorator.js';
import { Class } from 'type-fest';
import {
  Exceptions,
  ExceptionsMetadata,
} from './exception/exceptions.decorator.js';
import { UseGuards, UseGuardMetadata } from './guard/use-guards.decorator.js';
import { Ctx, CtxMetadata } from './decorator/ctx.decorator.js';
import { Handler } from './handler.type.js';

export interface ControllerFullMetadata {
  controller: ControllerOptions;
  params: ZParamsMetadata | undefined;
  query: ZQueryMetadata | undefined;
  headers: ZHeadersMetadata | undefined;
  body: ZBodyMetadata | undefined;
  response: ZResMetadata | undefined;
  exceptions: ExceptionsMetadata | undefined;
  guard: UseGuardMetadata | undefined;
  ctx: CtxMetadata | undefined;
}

export function getControllerFullMetadata(
  target: Class<Handler>,
): ControllerFullMetadata | undefined {
  const controller = Controller.getMetadata(target);
  if (!controller) {
    return undefined;
  }
  const propertyKey: keyof Handler = 'handle';
  return {
    controller,
    params: ZParams.getMetadata(target, propertyKey),
    query: ZQuery.getMetadata(target, propertyKey),
    headers: ZHeaders.getMetadata(target, propertyKey),
    body: ZBody.getMetadata(target, propertyKey),
    response: ZRes.getMetadata(target),
    exceptions: Exceptions.getMetadata(target),
    guard: UseGuards.getMetadata(target),
    ctx: Ctx.getMetadata(target, propertyKey),
  };
}
