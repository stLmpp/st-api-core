import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

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
  }: Partial<ApiState & { metadata?: Record<string | symbol, unknown> }> = {},
): Promise<T> | T {
  const entries: [string | symbol, unknown][] = Object.entries(metadata);
  const entriesSymbol = Object.getOwnPropertySymbols(metadata).map(
    (key) => [key, metadata[key]] as [symbol, unknown],
  );
  const metadataMap = new Map<string | symbol, unknown>(
    entries.concat(entriesSymbol),
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
