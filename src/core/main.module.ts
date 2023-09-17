import { DynamicModule, Module, Type } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CoreModule } from './core.module.js';

export interface MainModuleOptions {
  secrets: Record<string, string>;
  module: Type;
}

@Module({})
export class MainModule {
  static create(options: MainModuleOptions): DynamicModule {
    return {
      module: MainModule,
      imports: [
        ConfigModule.forRoot({
          load: [() => options.secrets],
        }),
        CoreModule.forRoot(),
        options.module,
      ],
    };
  }
}
