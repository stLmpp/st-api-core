import { type INestApplication, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { type OpenAPIObject } from 'openapi3-ts/oas30';

import { addMissingExceptionsOpenapi } from './exception/add-missing-exceptions-openapi.js';
import { internalStateMiddleware } from './internal-state/internal-state.js';

export interface ConfigureAppOptions {
  swagger?: {
    documentBuilder?: (document: DocumentBuilder) => DocumentBuilder;
    route?: string;
    documentFactory?: (document: OpenAPIObject) => OpenAPIObject;
  };
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
      internalStateMiddleware(),
      helmet({
        contentSecurityPolicy: false,
      }),
      compression(),
    )
    .enableVersioning({
      type: VersioningType.URI,
      prefix: 'v',
    });
  if (options?.swagger) {
    const documentBuilder =
      options.swagger.documentBuilder ??
      DEFAULT_OPTIONS.swagger.documentBuilder;
    const config = documentBuilder(
      new DocumentBuilder().setTitle('API').setVersion('1.0.0'),
    ).build();
    const documentFactory =
      options.swagger.documentFactory ??
      DEFAULT_OPTIONS.swagger.documentFactory;
    const document = documentFactory(
      SwaggerModule.createDocument(app, config, {}) as OpenAPIObject,
    );
    addMissingExceptionsOpenapi(document);
    SwaggerModule.setup(
      options.swagger.route ?? DEFAULT_OPTIONS.swagger.route,
      app,
      document as never,
      {
        swaggerOptions: {
          displayRequestDuration: true,
        },
      },
    );
  }
  return app;
}