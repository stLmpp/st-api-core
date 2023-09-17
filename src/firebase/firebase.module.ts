import { DynamicModule, Module } from '@nestjs/common';
import { FirebaseOptions, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

import { NodeEnvEnum } from '../core/node-env.js';

import { FirebaseApp } from './firebase-app.js';
import { FirebaseAuth } from './firebase-auth.js';

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
