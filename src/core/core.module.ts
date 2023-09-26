import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { CoreExceptionsFilter } from './exception/core-exceptions.filter.js';
import { NodeEnv, NodeEnvEnum } from './node-env.token.js';
import { ZodValidationPipe } from './zod/zod-validation.pipe.js';

@Module({})
export class CoreModule {
  static forRoot(): DynamicModule {
    return {
      module: CoreModule,
      providers: [
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
            config.get('NODE_ENV') === 'development'
              ? NodeEnvEnum.Development
              : NodeEnvEnum.Production,
        },
      ],
      imports: [ConfigModule],
    };
  }
}
