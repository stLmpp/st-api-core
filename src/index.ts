import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

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
export { getClazz } from './common/get-clazz.js';
export { isArray } from './common/is-array.js';
export {
  safe,
  type Safe,
  type SafeError,
  safeAsync,
  type SafeSuccess,
} from './common/safe.js';
export {
  formatZodErrorString,
  formatZodError,
  type ZodErrorFormatted,
} from './common/zod-error-formatter.js';

// Exceptions
export { addMissingExceptionsOpenapi } from './core/exception/add-missing-exceptions-openapi.js';
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
export { ZBody } from './core/z/z-body.decorator.js';
export { ZParams } from './core/z/z-params.decorator.js';
export { ZQuery } from './core/z/z-query.decorator.js';
export { ZRes } from './core/z/z-res.decorator.js';
export { ZInterceptor } from './core/z/z.interceptor.js';
export { type ZDto, zDto } from './core/z/z-dto.js';
export { ZValidationPipe } from './core/z/z-validation.pipe.js';
export { extendApi } from '@anatine/zod-openapi';

// Core
export { CoreModule } from './core/core.module.js';
export {
  type ConfigureAppOptions,
  configureApp,
} from './core/configure-app.js';
export { EnvironmentVariables } from './core/environment-variables.js';
export { NodeEnv, NodeEnvEnum } from './core/node-env.token.js';
export {
  getCorrelationId,
  apiStateMiddleware,
  createCorrelationId,
  apiStateRunInContext,
  getStateKey,
  getState,
  getTraceId,
  type ApiState,
  type ApiStateMiddlewareOptions,
} from './core/api-state/api-state.js';
export { CID, TID } from './core/api-state/decorators.js';
export { StApiDevMode } from './core/st-api-dev-mode.token.js';
export { StApiName, provideStApiName } from './core/st-api-name.token.js';
