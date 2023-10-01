import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AdDevMode } from './ad-dev-mode.token.js';
import { EnvironmentVariables } from './environment-variables.js';
import { CoreExceptionsFilter } from './exception/core-exceptions.filter.js';
import { NodeEnv, NodeEnvEnum } from './node-env.token.js';
import { ZodValidationPipe } from './zod/zod-validation.pipe.js';
import { ZodInterceptor } from './zod/zod.interceptor.js';

@Module({})
export class CoreModule {
  static forRoot(): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: ZodInterceptor,
        },
        {
          provide: APP_PIPE,
          useClass: ZodValidationPipe,
        },
        {
          provide: APP_FILTER,
          useClass: CoreExceptionsFilter,
        },
        {
          inject: [ConfigService],
          provide: NodeEnv,
          useFactory: (config: ConfigService) =>
            config.get(EnvironmentVariables.NodeEnv) === 'development'
              ? NodeEnvEnum.Development
              : NodeEnvEnum.Production,
        },
        {
          inject: [ConfigService],
          provide: AdDevMode,
          useFactory: (config: ConfigService) =>
            config.get(EnvironmentVariables.NodeEnv) === 'true',
        },
      ],
      imports: [ConfigModule],
    };
  }
}
