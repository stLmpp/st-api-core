import {INestApplication, Type, VersioningType,} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {ExpressAdapter} from '@nestjs/platform-express';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import compression from 'compression';
import express, {Express} from 'express';
import helmet from 'helmet';
import {OpenAPIObject} from 'openapi3-ts/oas30';

import {addMissingExceptionsOpenapi} from './exception/add-missing-exceptions-openapi.js';
import {internalStateMiddleware} from './internal-state.js';
import {MainModule} from './main.module.js';

(BigInt.prototype as bigint & { toJSON(): number }).toJSON = function () {
  return Number(this);
};

export interface CreateAppOptions {
  module: Type;
}

export interface App {
  nestApp: INestApplication;
  expressApp: Express;
}

let app: App | undefined;

export async function createApp(options: CreateAppOptions): Promise<App> {
  if (app) {
    return app;
  }
  const expressApp = express();
  const nestApp = await NestFactory.create(
    MainModule.create({
      module: options.module,
    }),
    new ExpressAdapter(expressApp),
  );

  nestApp
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
  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(nestApp, config, {});
  addMissingExceptionsOpenapi(document as OpenAPIObject);
  SwaggerModule.setup('help', nestApp, document, {
    swaggerOptions: {
      displayRequestDuration: true,
    },
  });

  await nestApp.init();
  return (app = { expressApp, nestApp });
}
