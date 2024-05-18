import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

import { Request, RequestHandler } from 'express';

export interface ApiStateInternal {
  /**
   * @description ID of the execution
   */
  executionId: string;
  /**
   * @description ID that correlates all that happened in the process
   */
  correlationId: string;
  /**
   * @description ID to track all the executions that correlates with one another
   */
  traceId: string;
  /**
   * @description Any other metadata
   */
  metadata: Map<string | symbol, unknown>;
}

export type ApiState = Omit<ApiStateInternal, 'metadata'>;

const ASYNC_LOCAL_STORAGE = new AsyncLocalStorage<ApiStateInternal>();

export function createCorrelationId(): string {
  return randomUUID();
}

export function getStateKey<K extends keyof ApiState>(key: K): ApiState[K] {
  return getState()[key];
}

export function getStateMetadata(): Map<string | symbol, unknown> {
  return getStateInternal().metadata;
}

export function getStateMetadataKey(key: string | symbol): unknown {
  return getStateMetadata().get(key);
}

export function getCorrelationId(): string {
  return getStateKey('correlationId');
}

export function getTraceId(): string {
  return getStateKey('traceId');
}

export function getExecutionId(): string {
  return getStateKey('executionId');
}

export function getStateInternal(): ApiStateInternal {
  const state = ASYNC_LOCAL_STORAGE.getStore();
  if (!state) {
    // This should never happen, but we throw a regular Error here
    // instead of an Exception, to not run in a cyclic call
    // because Exception uses the getState method
    throw new Error(
      'Could not get internal state, make sure your function is running in the context',
    );
  }
  return state;
}

export function getState(): ApiState {
  return getStateInternal();
}

export function apiStateRunInContext<T>(
  run: () => T | Promise<T>,
  {
    metadata = {},
    ...partialState
  }: Partial<ApiState & { metadata?: Record<string, unknown> }> = {},
): Promise<T> | T {
  const metadataMap = new Map<string | symbol, unknown>(
    Object.entries(metadata),
  );
  const initialState: ApiStateInternal = {
    ...partialState,
    correlationId: partialState.correlationId ?? createCorrelationId(),
    traceId: partialState.traceId ?? createCorrelationId(),
    executionId: partialState.executionId ?? createCorrelationId(),
    metadata: metadataMap,
  };
  return ASYNC_LOCAL_STORAGE.run(initialState, run);
}

export interface ApiStateMiddlewareOptions {
  getTraceId?: (request: Request) => string | undefined | null;
  getCorrelationId?: (request: Request) => string | undefined | null;
  getExecutionId?: (request: Request) => string | undefined | null;
}

export function apiStateMiddleware(
  options?: ApiStateMiddlewareOptions,
): RequestHandler {
  function correlationIdGetter(request: Request) {
    const correlationIdCustom = options?.getCorrelationId?.(request);
    const correlationIdHeaderRaw = request.get('x-correlation-id');
    const correlationIdHeader = correlationIdHeaderRaw?.length
      ? correlationIdHeaderRaw
      : undefined;
    return correlationIdCustom || correlationIdHeader || createCorrelationId();
  }
  function traceIdGetter(request: Request) {
    const traceIdCustom = options?.getTraceId?.(request);
    const traceIdHeaderRaw = request.get('x-trace-id');
    const traceIdHeader = traceIdHeaderRaw?.length
      ? traceIdHeaderRaw
      : undefined;
    return traceIdCustom || traceIdHeader || createCorrelationId();
  }
  function executionIdGetter(request: Request) {
    const executionIdCustom = options?.getExecutionId?.(request);
    const executionIdHeaderRaw = request.get('x-trace-id');
    const executionIdHeader = executionIdHeaderRaw?.length
      ? executionIdHeaderRaw
      : undefined;
    return executionIdCustom || executionIdHeader || createCorrelationId();
  }
  return async (request, response, next) => {
    const correlationId = correlationIdGetter(request);
    const traceId = traceIdGetter(request);
    const executionId = executionIdGetter(request);
    response
      .setHeader('x-correlation-id', correlationId)
      .setHeader('x-trace-id', traceId)
      .setHeader('x-execution-id', executionId)
      .setHeader('x-st-api', 'true');
    apiStateRunInContext(
      () => {
        next();
      },
      {
        correlationId,
        traceId,
        executionId,
      },
    );
  };
}
