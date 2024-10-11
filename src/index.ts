import 'reflect-metadata';
import { extendZodWithOpenApi } from '@st-api/zod-openapi';
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

// Zod
export { extendApi } from '@st-api/zod-openapi';

// Api State
export { apiStateMiddleware } from './core/api-state/api-state.middleware.js';
export {
  getCorrelationId,
  createCorrelationId,
  apiStateRunInContext,
  getStateKey,
  getState,
  getTraceId,
  getExecutionId,
  type ApiState,
  getStateMetadataKey,
  getStateMetadata,
} from './core/api-state/api-state.js';

// Decorator
export {
  Controller,
  type ControllerOptions,
  type MethodType,
} from './core/decorator/controller.decorator.js';
export { Ctx } from './core/decorator/ctx.decorator.js';
export { ZBody } from './core/decorator/z-body.decorator.js';
export { ZHeaders } from './core/decorator/z-headers.decorator.js';
export { ZParams } from './core/decorator/z-params.decorator.js';
export { ZQuery } from './core/decorator/z-query.decorator.js';
export { ZRes } from './core/decorator/z-res.decorator.js';

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
  BAD_REQUEST_HEADERS,
  FORBIDDEN,
} from './core/exception/core-exceptions.js';
export { ExceptionSchema } from './core/exception/exception.schema.js';
export { exception, Exception } from './core/exception/exception.js';
export {
  type ExceptionArgs,
  type ExceptionFactory,
  type ExceptionType,
  type ExceptionFactoryWithError,
  type ExceptionFactoryWithoutError,
} from './core/exception/exception.type.js';
export { Exceptions } from './core/exception/exceptions.decorator.js';
export { getOpenapiExceptions } from './core/exception/get-openapi-exceptions.js';

// Guard
export { type CanActivate } from './core/guard/can-activate.interface.js';
export { GLOBAL_GUARDS } from './core/guard/global-guards.token.js';
export { UseGuards } from './core/guard/use-guards.decorator.js';

// Throttler
export {
  type ThrottleOptions,
  Throttle,
} from './core/throttler/throttle.decorator.js';
export { ThrottlerGuard } from './core/throttler/throttler.guard.js';
export { Throttler } from './core/throttler/throttler.js';
export {
  type ThrottlerOptions,
  type ThrottlerOptionsArgs,
} from './core/throttler/throttler.type.js';
export { ThrottlerOptionsToken } from './core/throttler/throttler-options.token.js';

// Root
export { type Handler } from './core/handler.type.js';
export { type HandlerContext } from './core/handler-context.js';
export {
  type HonoApp,
  type HonoAppOptions,
  createHonoApp,
} from './core/hono-app.js';
export { StApiName, provideStApiName } from './core/st-api-name.token.js';

// TODO add rate-limiter
