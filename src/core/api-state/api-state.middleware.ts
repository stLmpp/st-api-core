import { HonoRequest, MiddlewareHandler } from 'hono';
import { apiStateRunInContext, createCorrelationId } from './api-state.js';

function correlationIdGetter(request: HonoRequest) {
  const correlationIdHeaderRaw = request.header('x-correlation-id');
  const correlationIdHeader = correlationIdHeaderRaw?.length
    ? correlationIdHeaderRaw
    : undefined;
  return correlationIdHeader || createCorrelationId();
}

function traceIdGetter(request: HonoRequest) {
  const traceIdHeaderRaw = request.header('x-trace-id');
  const traceIdHeader = traceIdHeaderRaw?.length ? traceIdHeaderRaw : undefined;
  return traceIdHeader || createCorrelationId();
}

function executionIdGetter(request: HonoRequest) {
  const executionIdHeaderRaw = request.header('x-trace-id');
  const executionIdHeader = executionIdHeaderRaw?.length
    ? executionIdHeaderRaw
    : undefined;
  return executionIdHeader || createCorrelationId();
}

export interface ApiStateMiddlewareOptions {
  getTraceId?: (request: HonoRequest) => string | undefined | null;
  getCorrelationId?: (request: HonoRequest) => string | undefined | null;
  getExecutionId?: (request: HonoRequest) => string | undefined | null;
}

export function apiStateMiddleware(
  options?: ApiStateMiddlewareOptions,
): MiddlewareHandler {
  return async (c, next) => {
    const correlationId =
      options?.getCorrelationId?.(c.req) || correlationIdGetter(c.req);
    const traceId = options?.getTraceId?.(c.req) || traceIdGetter(c.req);
    const executionId =
      options?.getExecutionId?.(c.req) || executionIdGetter(c.req);
    await apiStateRunInContext(
      async () => {
        await next();
        c.header('x-correlation-id', correlationId);
        c.header('x-trace-id', traceId);
        c.header('x-execution-id', executionId);
        c.header('x-st-api', 'true');
      },
      {
        correlationId,
        traceId,
        executionId,
      },
    );
  };
}
