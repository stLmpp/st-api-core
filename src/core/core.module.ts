import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  ConfigurableModuleBuilder,
  type DynamicModule,
  Module,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import type { PackageJson } from 'type-fest';

import { safe } from '../common/safe.js';

import { EnvironmentVariables } from './environment-variables.js';
import { CoreExceptionsFilter } from './exception/core-exceptions.filter.js';
import { NodeEnv, NodeEnvEnum } from './node-env.token.js';
import { StApiDevMode } from './st-api-dev-mode.token.js';
import { StApiName } from './st-api-name.token.js';
import { ZInterceptor } from './z/z.interceptor.js';

export interface CoreModuleOptions {
  name?: string;
}

const {
  ConfigurableModuleClass,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<CoreModuleOptions>()
  .setClassMethodName('forRoot')
  .build();

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
      useFactory: (options: CoreModuleOptions) => {
        let name = options.name;
        if (!name) {
          const path = join(process.cwd(), 'package.json');
          const [error, packageJSONString] = safe(() =>
            readFileSync(path, 'utf8'),
          );
          if (error) {
            throw new ReferenceError(
              '[CoreModule] name was not provided and could not find package.json',
              {
                cause: error,
              },
            );
          }
          const [errorParsed, packageJSON] = safe<PackageJson>(() =>
            JSON.parse(packageJSONString),
          );
          if (errorParsed) {
            throw new TypeError(
              `[CoreModule] name was not provided and failed to parse package.json`,
              {
                cause: errorParsed,
              },
            );
          }
          if (
            !packageJSON ||
            typeof packageJSON !== 'object' ||
            typeof packageJSON.name !== 'string'
          ) {
            throw new Error(
              `[CoreModule] name was not provided and could not found package.json name property`,
              {
                cause: errorParsed,
              },
            );
          }
          name = packageJSON.name;
        }
        return name;
      },
    },
  ],
  imports: [ConfigModule],
  exports: [NodeEnv, StApiDevMode, StApiName],
})
export class CoreModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
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
