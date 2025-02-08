import { getReasonPhrase } from 'http-status-codes';
import type { SetOptional } from 'type-fest';

import { safe } from '../../common/safe.js';
import { getCorrelationId, getTraceId } from '../api-state/api-state.js';

import { ExceptionSchema } from './exception.schema.js';
import type {
  ExceptionArgs,
  ExceptionFactory,
  ExceptionFactoryWithError,
  ExceptionFactoryWithoutError,
  ExceptionType,
} from './exception.type.js';
import { ContentfulStatusCode, StatusCode } from 'hono/utils/http-status';

function getCorrelationIdWithDefault() {
  const [, correlationId] = safe(() => getCorrelationId());
  return correlationId ?? '';
}

function getTraceIdWithDefault() {
  const [, traceId] = safe(() => getTraceId());
  return traceId ?? '';
}

export class Exception extends Error {
  constructor(
    public readonly status: ContentfulStatusCode,
    message: string,
    public readonly errorCode: string,
    public readonly error: string,
    public readonly description?: string,
    correlationId = getCorrelationIdWithDefault(),
    traceId = getTraceIdWithDefault(),
  ) {
    super(message);
    this.name = 'Exception';
    this.correlationId = correlationId;
    this.traceId = traceId;
  }

  public readonly correlationId: string;
  public readonly traceId: string;

  /**
   * @deprecated Use the readonly property "status"
   */
  getStatus(): StatusCode {
    return this.status;
  }

  toJSON(): ExceptionType {
    return {
      correlationId: this.correlationId,
      error: this.error,
      errorCode: this.errorCode,
      message: this.message,
      status: this.status,
      traceId: this.traceId,
    };
  }

  equals(exception: unknown): boolean {
    return (
      exception instanceof Exception &&
      exception.errorCode === this.errorCode &&
      exception.status === this.status
    );
  }

  static isExceptionJSON(value: unknown): value is ExceptionType {
    const result = ExceptionSchema.safeParse(value);
    return result.success;
  }

  static fromJSON(exceptionJson: ExceptionType): Exception {
    return new Exception(
      exceptionJson.status as ContentfulStatusCode,
      exceptionJson.message,
      exceptionJson.errorCode,
      exceptionJson.error,
      exceptionJson.description,
      exceptionJson.correlationId,
      exceptionJson.traceId,
    );
  }
}

export function exception(args: ExceptionArgs): ExceptionFactoryWithoutError;
export function exception(
  args: SetOptional<ExceptionArgs, 'error'>,
): ExceptionFactoryWithError;
export function exception(
  args: SetOptional<ExceptionArgs, 'error'>,
): ExceptionFactory {
  return (error) =>
    new Exception(
      args.status,
      args.message ?? getReasonPhrase(args.status),
      args.errorCode,
      args.error ?? (error || getReasonPhrase(args.status)),
      args.description,
    );
}
