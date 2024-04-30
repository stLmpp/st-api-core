import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';

import {
  ROUTE_NOT_FOUND,
  UNKNOWN_INTERNAL_SERVER_ERROR,
} from './core-exceptions.js';
import { Exception } from './exception.js';

@Catch()
export class CoreExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  async catch(unknownException: unknown, host: ArgumentsHost): Promise<void> {
    const { httpAdapter } = this.httpAdapterHost;

    const context = host.switchToHttp();

    let exception: Exception | undefined = undefined;

    if (
      unknownException instanceof NotFoundException &&
      unknownException.message.startsWith('Cannot')
    ) {
      exception = ROUTE_NOT_FOUND(
        `Route not found: ${context.getRequest<Request>().path}`,
      );
    }

    if (unknownException instanceof Exception) {
      exception = unknownException;
    }

    if (exception) {
      Logger.error(
        `An exception occurred. Details: ${JSON.stringify(exception.toJSON())}`,
      );
    } else {
      Logger.error(
        `An unknown error occurred. Error: "${unknownException}". Details: ${JSON.stringify(
          unknownException,
        )}`,
      );
      exception = UNKNOWN_INTERNAL_SERVER_ERROR();
    }

    httpAdapter.reply(
      context.getResponse(),
      exception!.toJSON(),
      exception!.getStatus(),
    );
  }
}
