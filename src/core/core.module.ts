import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { EnvironmentVariables } from './environment-variables.js';
import { CoreExceptionsFilter } from './exception/core-exceptions.filter.js';
import { NodeEnv, NodeEnvEnum } from './node-env.token.js';
import { StApiDevMode } from './st-api-dev-mode.token.js';
import { provideStApiName, StApiName } from './st-api-name.token.js';
import { ZInterceptor } from './z/z.interceptor.js';

interface CoreModuleOptions {
  name: string;
}

@Module({})
export class CoreModule {
  static forRoot(options: CoreModuleOptions): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: ZInterceptor,
        },
        {
          provide: APP_FILTER,
          useClass: CoreExceptionsFilter,
        },
        {
          inject: [ConfigService],
          provide: NodeEnv,
          useFactory: (config: ConfigService) =>
            config.get(EnvironmentVariables.NodeEnv) === 'production'
              ? NodeEnvEnum.Production
              : NodeEnvEnum.Development,
        },
        {
          inject: [ConfigService],
          provide: StApiDevMode,
          useFactory: (config: ConfigService) =>
            config.get(EnvironmentVariables.DevMode) === 'true',
        },
        provideStApiName(options.name),
      ],
      imports: [ConfigModule],
      exports: [StApiDevMode, StApiName],
    };
  }
}
