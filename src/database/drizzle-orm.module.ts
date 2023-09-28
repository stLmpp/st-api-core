import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Module,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { getClazz } from '../common/get-clazz.js';
import { EnvironmentVariables } from '../core/environment-variables.js';

export class Drizzle extends getClazz<PostgresJsDatabase>() {}

export interface DrizzleOrmModuleOptions {
  connectionString?: string;
}

const {
  MODULE_OPTIONS_TOKEN,
  ConfigurableModuleClass,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<DrizzleOrmModuleOptions>()
  .setExtras(
    {
      isGlobal: true,
    },
    (definitions, extras) => ({
      ...definitions,
      global: extras.isGlobal,
    }),
  )
  .setClassMethodName('forRoot')
  .build();

@Module({
  providers: [
    {
      provide: Drizzle,
      useFactory: (options: DrizzleOrmModuleOptions, config: ConfigService) => {
        const client = postgres(
          options.connectionString ??
            config.getOrThrow(EnvironmentVariables.DatabaseUrl),
        );
        return drizzle(client, {
          logger: true,
        });
      },
      inject: [MODULE_OPTIONS_TOKEN, ConfigService],
    },
  ],
  exports: [Drizzle],
  imports: [ConfigModule],
})
export class DrizzleOrmModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
    return {
      ...super.forRoot(options),
    };
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE = {}): DynamicModule {
    return {
      ...super.forRootAsync(options),
    };
  }
}
