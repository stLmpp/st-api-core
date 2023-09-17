import { DynamicModule, Injectable, Module } from '@nestjs/common';
import {
  FirebaseApp as FirebaseAppInterface,
  FirebaseOptions,
  initializeApp,
} from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';

import { getClazz } from '../common/get-clazz.js';
import { NodeEnvEnum } from '../core/node-env.js';

@Injectable()
export class FirebaseAuth extends getClazz<Auth>() {}

@Injectable()
export class FirebaseApp extends getClazz<FirebaseAppInterface>() {}

@Module({})
export class FirebaseModule {
  static forRoot(options?: FirebaseOptions): DynamicModule {
    return {
      module: FirebaseModule,
      exports: [FirebaseApp, FirebaseAuth],
      providers: [
        {
          provide: FirebaseApp,
          useFactory: () => initializeApp(options ?? {}),
        },
        {
          provide: FirebaseAuth,
          useFactory: (app: FirebaseApp, nodeEnv: NodeEnvEnum) => {
            const auth = getAuth(app);
            if (nodeEnv === NodeEnvEnum.Development) {
              connectAuthEmulator(auth, 'http://127.0.0.1:9099');
            }
            return auth;
          },
        },
      ],
    };
  }
}
