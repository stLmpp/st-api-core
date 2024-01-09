import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

import { Request, RequestHandler } from 'express';

export interface ApiState {
  correlationId: string;
  traceId: string;
  [key: string | symbol]: unknown;
}

const ASYNC_LOCAL_STORAGE = new AsyncLocalStorage<ApiState>();

export function createCorrelationId(): string {
  return randomUUID();
}

export function getStateKey<K extends keyof ApiState>(key: K): ApiState[K] {
  return getState()[key];
}

export function getCorrelationId(): string {
  return getStateKey('correlationId');
}

export function getTraceId(): string {
  return getStateKey('traceId');
}

export function getState(): ApiState {
  const state = ASYNC_LOCAL_STORAGE.getStore();
  if (!state) {
    throw new Error(
      'Could not get internal state, make sure your function is running in the context',
    );
  }
  return state;
}

export function apiStateRunInContext<T>(
  run: () => T | Promise<T>,
  partialState: Partial<ApiState> = {},
): Promise<T> | T {
  const initialState: ApiState = {
    ...partialState,
    correlationId: partialState.correlationId ?? createCorrelationId(),
    traceId: partialState.traceId ?? createCorrelationId(),
  };
  return ASYNC_LOCAL_STORAGE.run(initialState, run);
}

export interface ApiStateMiddlewareOptions {
  getTraceId?: (request: Request) => string;
  getCorrelationId?: (request: Request) => string;
}

export function apiStateMiddleware(
  options?: ApiStateMiddlewareOptions,
): RequestHandler {
  const correlationIdGetter =
    options?.getCorrelationId ??
    ((request) => {
      const correlationIdHeaderRaw = request.get('x-correlation-id');
      const correlationIdHeader = correlationIdHeaderRaw?.length
        ? correlationIdHeaderRaw
        : undefined;
      return correlationIdHeader ?? createCorrelationId();
    });
  const traceIdGetter =
    options?.getTraceId ??
    ((request) => {
      const traceIdHeaderRaw = request.get('x-trace-id');
      const traceIdHeader = traceIdHeaderRaw?.length
        ? traceIdHeaderRaw
        : undefined;
      return traceIdHeader ?? createCorrelationId();
    });
  return async (request, response, next) => {
    const correlationId = correlationIdGetter(request);
    const traceId = traceIdGetter(request);
    response
      .setHeader('x-correlation-id', correlationId)
      .setHeader('x-trace-id', traceId);
    apiStateRunInContext(
      () => {
        next();
      },
      {
        correlationId,
        traceId,
      },
    );
  };
}
