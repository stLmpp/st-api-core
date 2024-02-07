import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Global,
  Module,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { EnvironmentVariables } from './environment-variables.js';
import { CoreExceptionsFilter } from './exception/core-exceptions.filter.js';
import { NodeEnv, NodeEnvEnum } from './node-env.token.js';
import { StApiDevMode } from './st-api-dev-mode.token.js';
import { StApiName } from './st-api-name.token.js';
import { ZInterceptor } from './z/z.interceptor.js';

export interface CoreModuleOptions {
  name: string;
}

const {
  ConfigurableModuleClass,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<CoreModuleOptions>()
  .setClassMethodName('forRoot')
  .build();

@Global()
@Module({
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
    {
      provide: StApiName,
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (options: CoreModuleOptions) => options.name,
    },
  ],
  imports: [ConfigModule],
  exports: [NodeEnv, StApiDevMode, StApiName],
})
export class CoreModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    return {
      ...super.forRoot(options),
      global: true,
    };
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      ...super.forRootAsync(options),
      global: true,
    };
  }
}
