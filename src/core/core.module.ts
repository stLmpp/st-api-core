import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { AllExceptionsFilter } from './all-exceptions.filter.js';
import { NestZodPipe } from './zod/nest-zod.pipe.js';

@Module({})
export class CoreModule {
  static forRoot(): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        {
          provide: APP_PIPE,
          useClass: NestZodPipe,
        },
        {
          provide: APP_FILTER,
          useClass: AllExceptionsFilter,
        },
      ],
      imports: [],
    };
  }
}
