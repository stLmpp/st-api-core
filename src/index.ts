// Common
export { arrayGroupToMap } from './common/array-group-to-map.js';
export { arrayUniqBy } from './common/array-uniq-by.js';
export { arrayUniqWith } from './common/array-uniq-with.js';
export { coerceArray } from './common/coerce-array.js';
export {
  ParamBigIntSchema,
  ParamBooleanSchema,
  ParamDatetimeSchema,
  ParamDoubleSchema,
  ParamIntSchema,
} from './common/common-schemas.js';
export { isArray } from './common/is-array.js';
export {
  safe,
  type SafeAsync,
  type SafeAsyncError,
  safeAsync,
  type SafeAsyncSuccess,
} from './common/safe.js';
export {
  formatZodErrorString,
  formatZodError,
  type ZodErrorFormatted,
} from './common/zod-error-formatter.js';

// Exceptions
export {
  BAD_REQUEST_BODY,
  BAD_REQUEST_PARAMS,
  BAD_REQUEST_QUERY,
  TOO_MANY_REQUESTS,
  INVALID_RESPONSE,
  ROUTE_NOT_FOUND,
  UNKNOWN_INTERNAL_SERVER_ERROR,
} from './core/exception/core-exceptions.js';
export { exception, Exception } from './core/exception/exception.js';
export {
  type ExceptionArgs,
  type ExceptionFactory,
  type ExceptionType,
  type ExceptionFactoryWithError,
  type ExceptionFactoryWithoutError,
} from './core/exception/exception.type.js';
export { Exceptions } from './core/exception/exceptions.decorator.js';

// Throttler
export { ThrottlerGuard } from './core/throttler/throttler.guard.js';
export { Throttler } from './core/throttler/throttler.js';
export {
  type ThrottlerOptions,
  type ThrottlerOptionsArgs,
} from './core/throttler/throttler.type.js';
export { ThrottlerOptionsToken } from './core/throttler/throttler-options.token.js';

// Zod
export { Body } from './core/zod/body.decorator.js';
export { Params } from './core/zod/params.decorator.js';
export { QueryParams } from './core/zod/query-params.decorator.js';
export { Response } from './core/zod/response.decorator.js';
export { ZodInterceptor } from './core/zod/zod.interceptor.js';
export { type ZodDto, zodDto } from './core/zod/zod-dto.js';
export { ZodValidationPipe } from './core/zod/zod-validation.pipe.js';

// Core
export { AdDevMode } from './core/ad-dev-mode.token.js';
export { CoreModule } from './core/core.module.js';
export { EnvironmentVariables } from './core/environment-variables.js';
export { createApi } from './core/create-api.js';
export { getCorrelationId } from './core/internal-state.js';
export { NodeEnv } from './core/node-env.token.js';

// Database
export {
  Drizzle,
  type DrizzleOrmModuleOptions,
  DrizzleOrmModule,
} from './database/drizzle-orm.module.js';

// Firebase
export { FirebaseModule } from './firebase/firebase.module.js';
export {
  type FirebaseAdminAsyncOptionsType,
  type FirebaseAdminModuleOptions,
  type FirebaseAdminOptionsType,
} from './firebase/firebase-admin.config.js';
export { FirebaseAdminModule } from './firebase/firebase-admin.module.js';
export { FirebaseAdminApp } from './firebase/firebase-admin-app.js';
export { FirebaseAdminAuth } from './firebase/firebase-admin-auth.js';
export { FirebaseAdminFirestore } from './firebase/firebase-admin-firestore.js';
export { FirebaseApp } from './firebase/firebase-app.js';
export { FirebaseAuth } from './firebase/firebase-auth.js';
export {
  FirestoreThrottler,
  FirestoreThrottlerCollectionNameToken,
} from './firebase/firestore-throttler.js';
