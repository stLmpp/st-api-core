import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

import type { RequestHandler } from 'express';

export interface InternalState {
  correlationId: string;
}

const ASYNC_LOCAL_STORAGE = new AsyncLocalStorage<InternalState>();

export function createCorrelationId(): string {
  return randomUUID();
}

export function getCorrelationId(): string {
  const state = ASYNC_LOCAL_STORAGE.getStore();
  if (!state) {
    throw new Error(
      'Could not get internal state, make sure your function is running in the context',
    );
  }
  return state.correlationId;
}

export function runInContext<T>(
  run: () => T | Promise<T>,
  partialState: Partial<InternalState> = {},
): Promise<T> | T {
  const initialState: InternalState = {
    correlationId: partialState.correlationId ?? createCorrelationId(),
  };
  return ASYNC_LOCAL_STORAGE.run(initialState, run);
}

export function internalStateMiddleware(): RequestHandler {
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
    runInContext(
      () => {
        next();
      },
      {
        correlationId,
      },
    );
  };
}
