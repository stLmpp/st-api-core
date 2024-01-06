import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

import type { RequestHandler } from 'express';

export interface ApiState {
  correlationId: string;
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
  };
  return ASYNC_LOCAL_STORAGE.run(initialState, run);
}

export function apiStateMiddleware(): RequestHandler {
  return async (request, response, next) => {
    const correlationIdHeaderRaw = request.get('x-correlation-id');
    const correlationIdHeader = correlationIdHeaderRaw?.length
      ? correlationIdHeaderRaw
      : undefined;
    const correlationIdQueryRaw = request.query['correlationId'];
    const correlationIdQuery =
      typeof correlationIdQueryRaw === 'string' && correlationIdQueryRaw.length
        ? correlationIdQueryRaw
        : undefined;
    const correlationId =
      correlationIdHeader ?? correlationIdQuery ?? createCorrelationId();
    response.setHeader('x-correlation-id', correlationId);
    apiStateRunInContext(
      () => {
        next();
      },
      {
        correlationId,
      },
    );
  };
}
