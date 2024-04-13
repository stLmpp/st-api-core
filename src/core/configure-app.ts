import { type INestApplication, VersioningType } from '@nestjs/common';
import {
  DocumentBuilder,
  type SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import compression from 'compression';
import { type Request } from 'express';
import helmet from 'helmet';
import { type OpenAPIObject } from 'openapi3-ts/oas30';

import { apiStateMiddleware } from './api-state/api-state.js';
import { addMissingExceptionsOpenapi } from './exception/add-missing-exceptions-openapi.js';
import { Exception } from './exception/exception.js';
import type { ExceptionFactory } from './exception/exception.type.js';
import { getOpenapiExceptions } from './exception/get-openapi-exceptions.js';

export interface ConfigureAppOptions {
  swagger?: {
    documentBuilder?: (document: DocumentBuilder) => DocumentBuilder;
    route?: string;
    documentFactory?: (document: OpenAPIObject) => OpenAPIObject;
    options?: SwaggerCustomOptions;
  };
  getTraceId?: (request: Request) => string | undefined | null;
  getCorrelationId?: (request: Request) => string | undefined | null;
  getExecutionId?: (request: Request) => string | undefined | null;
  extraGlobalExceptions?: Array<ExceptionFactory | Exception>;
}

const DEFAULT_OPTIONS = {
  swagger: {
    route: 'help',
    documentBuilder: (document) => document,
    documentFactory: (document) => document,
  },
} satisfies ConfigureAppOptions;

export function configureApp(
  app: INestApplication,
  options?: ConfigureAppOptions,
): INestApplication {
  app
    .use(
      apiStateMiddleware({
        getTraceId: options?.getTraceId,
        getCorrelationId: options?.getCorrelationId,
      }),
      helmet({
        contentSecurityPolicy: false,
      }),
      compression(),
    )
    .enableVersioning({
      type: VersioningType.URI,
      prefix: 'v',
    })
    .enableShutdownHooks();
  if (options?.swagger) {
    const documentBuilder =
      options.swagger.documentBuilder ??
      DEFAULT_OPTIONS.swagger.documentBuilder;
    const config = documentBuilder(
      // TODO update to swagger 3.1.0: https://github.com/anatine/zod-plugins/issues/191
      new DocumentBuilder().setTitle('API').setVersion('1.0.0'),
    ).build();
    const documentFactory =
      options.swagger.documentFactory ??
      DEFAULT_OPTIONS.swagger.documentFactory;
    const document = documentFactory(
      SwaggerModule.createDocument(app, config, {}) as OpenAPIObject,
    );

    addMissingExceptionsOpenapi(
      document,
      getOpenapiExceptions(options.extraGlobalExceptions ?? []),
    );
    SwaggerModule.setup(
      options.swagger.route ?? DEFAULT_OPTIONS.swagger.route,
      app,
      document as never,
      {
        ...options.swagger.options,
        swaggerOptions: {
          displayRequestDuration: true,
          ...options.swagger.options?.swaggerOptions,
        },
      },
    );
  }
  return app;
}
