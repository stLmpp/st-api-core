import { Type } from '@nestjs/common';
import { defineSecret } from 'firebase-functions/params';
import { https } from 'firebase-functions/v2';

import { createApp } from './create-app.js';
import { getEnvironmentVariables } from './get-environment-variables.js';

const DATABASE_URL = defineSecret('DATABASE_URL');

export function createApi(module: Type): https.HttpsFunction {
  const environment = getEnvironmentVariables();
  return https.onRequest(
    {
      secrets: [DATABASE_URL],
      timeoutSeconds: environment.AD_TIMEOUT_SECONDS,
      cpu: environment.AD_CPU,
      region: environment.AD_REGION,
      minInstances: environment.AD_MIN_INSTANCES,
      maxInstances: environment.AD_MAX_INSTANCES,
      concurrency: environment.AD_CONCURRENCY,
      memory: environment.AD_MEMORY,
    },
    async (request, response) => {
      const { expressApp } = await createApp({
        secrets: {
          DATABASE_URL,
        },
        module,
      });
      expressApp(request, response);
    },
  );
}
