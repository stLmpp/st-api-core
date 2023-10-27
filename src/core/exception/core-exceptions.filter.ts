import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';
import type { Class } from 'type-fest';

import {
  ROUTE_NOT_FOUND,
  UNKNOWN_INTERNAL_SERVER_ERROR,
} from './core-exceptions.js';
import { Exception } from './exception.js';

type PossibleException<T = any> = {
  type: Class<T>;
  condition?: (exception: T) => boolean;
  exception?: (exception: T, context: HttpArgumentsHost) => Exception;
};

function possibleException<T>(
  options: PossibleException<T>,
): PossibleException<T> {
  return options;
}

@Catch()
export class CoreExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private readonly possibleExceptions: PossibleException[] = [
    possibleException({
      type: NotFoundException,
      condition: (exception) => exception.message.startsWith('Cannot'),
      exception: (_, context) =>
        ROUTE_NOT_FOUND(
          `Route not found: ${context.getRequest<Request>().path}`,
        ),
    }),
    possibleException({
      type: Exception,
    }),
  ];

  async catch(unknownException: unknown, host: ArgumentsHost): Promise<void> {
    const { httpAdapter } = this.httpAdapterHost;

    const context = host.switchToHttp();

    let exception: Exception | undefined = undefined;

    for (const { condition, exception: exceptionGetter, type } of this
      .possibleExceptions) {
      if (
        !(unknownException instanceof type) ||
        (condition && !condition(unknownException))
      ) {
        continue;
      }
      exception =
        exceptionGetter?.(unknownException, context) ?? unknownException;
    }

    if (!exception) {
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
