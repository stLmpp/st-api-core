import { z } from 'zod';

import { ParamIntSchema } from '../common/common-schemas.js';
import { formatZodErrorString } from '../common/zod-error-formatter.js';

const EnvironmentSchema = z.object({
  AD_TIMEOUT_SECONDS: ParamIntSchema.default('20').pipe(z.number().positive()),
  AD_CPU: ParamIntSchema.default('1').pipe(z.number().positive()),
  AD_REGION: z
    .enum([
      'asia-east1',
      'asia-northeast1',
      'asia-northeast2',
      'europe-north1',
      'europe-west1',
      'europe-west4',
      'us-central1',
      'us-east1',
      'us-east4',
      'us-west1',
      'asia-east2',
      'asia-northeast3',
      'asia-southeast1',
      'asia-southeast2',
      'asia-south1',
      'australia-southeast1',
      'europe-central2',
      'europe-west2',
      'europe-west3',
      'europe-west6',
      'northamerica-northeast1',
      'southamerica-east1',
      'us-west2',
      'us-west3',
      'us-west4',
    ])
    .default('us-east1'),
  AD_MIN_INSTANCES: ParamIntSchema.default('0').pipe(z.number().nonnegative()),
  AD_MAX_INSTANCES: ParamIntSchema.default('2').pipe(z.number().positive()),
  AD_CONCURRENCY: ParamIntSchema.default('50').pipe(z.number().positive()),
  AD_MEMORY: z.enum(['128MiB', '256MiB', '512MiB', '1GiB']).default('256MiB'),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export function getEnvironmentVariables(): Environment {
  const result = EnvironmentSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables. Error: ${formatZodErrorString(
        result.error,
      )}`,
    );
  }
  return result.data;
}
