import type { Class, PackageJson } from 'type-fest';
import { Injector, Provider } from '@stlmpp/di';
import { Hono, HonoRequest } from 'hono';
import { MethodType } from './decorator/controller.decorator.js';
import { apiStateMiddleware } from './api-state/api-state.middleware.js';
import { swaggerUI, SwaggerUIOptions } from '@hono/swagger-ui';
import { StatusCodes } from 'http-status-codes';
import { createHeaderValidator } from './internal/create-header-validator.js';
import { createBodyValidator } from './internal/create-body-validator.js';
import { createQueryValidator } from './internal/create-query-validator.js';
import { createParamValidator } from './internal/create-param-validator.js';
import { getControllerFullMetadata } from './get-controller-full-metadata.js';
import { throwInternal } from './throw-internal.js';
import { Openapi } from './openapi.js';
import { GLOBAL_GUARDS } from './guard/global-guards.token.js';
import { Handler } from './handler.type.js';
import { secureHeaders } from 'hono/secure-headers';
import { compress } from 'hono/compress';
import { OpenAPIObject } from 'openapi3-ts/oas30';
import { StApiName } from './st-api-name.token.js';
import path from 'node:path';
import { safe, safeAsync } from '../common/safe.js';
import fs from 'node:fs';
import { FORBIDDEN, INVALID_RESPONSE } from './exception/core-exceptions.js';
import { formatZodErrorString } from '../common/zod-error-formatter.js';
import { ExceptionFactory } from './exception/exception.type.js';
import { Exception } from './exception/exception.js';
import { cors } from 'hono/cors';

type CorsOptions = NonNullable<Parameters<typeof cors>[0]>;

export interface HonoAppOptions<T extends Hono> {
  hono: T;
  controllers: Class<Handler>[];
  providers?: Array<Provider | Class<any>>;
  swaggerDocumentBuilder?: (document: OpenAPIObject) => OpenAPIObject;
  swaggerUIOptions?: Partial<SwaggerUIOptions>;
  name?: string;
  getTraceId?: (request: HonoRequest) => string | undefined | null;
  getCorrelationId?: (request: HonoRequest) => string | undefined | null;
  getExecutionId?: (request: HonoRequest) => string | undefined | null;
  extraGlobalExceptions?: Array<ExceptionFactory | Exception>;
  cors?: CorsOptions;
}

export interface HonoApp<T extends Hono> {
  hono: T;
  injector: Injector;
}

export async function createHonoApp<T extends Hono>({
  hono,
  controllers,
  providers,
  swaggerDocumentBuilder,
  ...options
}: HonoAppOptions<T>): Promise<HonoApp<T>> {
  const injector = Injector.create('App');
  providers ??= [];
  providers.unshift({
    provide: StApiName,
    useFactory: () => {
      let name = options.name;
      if (!name) {
        const filePath = path.join(process.cwd(), 'package.json');
        const [error, packageJSONString] = safe(() =>
          fs.readFileSync(filePath, 'utf8'),
        );
        if (error) {
          throw new ReferenceError(
            '[Core] name was not provided and could not find package.json',
            {
              cause: error,
            },
          );
        }
        const [errorParsed, packageJSON] = safe<PackageJson>(() =>
          JSON.parse(packageJSONString),
        );
        if (errorParsed) {
          throw new TypeError(
            `[Core] name was not provided and failed to parse package.json`,
            {
              cause: errorParsed,
            },
          );
        }
        if (
          !packageJSON ||
          typeof packageJSON !== 'object' ||
          typeof packageJSON.name !== 'string'
        ) {
          throw new ReferenceError(
            `[Core] name was not provided and could not found package.json name property`,
            {
              cause: errorParsed,
            },
          );
        }
        name = packageJSON.name;
      }
      return name;
    },
  });
  injector.register(providers);

  const openapi = new Openapi({
    openapi: '3.0.0',
    info: {
      title: 'App',
      version: '1.0.0',
    },
    paths: {},
  });

  hono.use(secureHeaders()).use(compress());

  if (options.cors) {
    hono.use(cors(options.cors));
  }

  hono
    .get('/openapi.json', (c) => c.json(openapi.getDocument()))
    .use(
      apiStateMiddleware({
        getCorrelationId: options?.getCorrelationId,
        getExecutionId: options?.getExecutionId,
        getTraceId: options?.getTraceId,
      }),
    )
    .use(
      '/openapi',
      swaggerUI({
        url: '/openapi.json',
        persistAuthorization: true,
        displayRequestDuration: true,
        deepLinking: true,
        ...options.swaggerUIOptions,
      }),
    )
    .get('/help', (c) => c.redirect('/openapi', StatusCodes.MOVED_PERMANENTLY));

  const globalGuards = await injector.resolveAll(GLOBAL_GUARDS, {
    optional: true,
  });

  const controllersWithMetadata = controllers
    .map((controller) => ({
      controller,
      fullMetadata: getControllerFullMetadata(controller),
    }))
    .sort((controllerA, controllerB) => {
      let pathA = controllerA.fullMetadata?.controller.path ?? '/';
      let pathB = controllerB.fullMetadata?.controller.path ?? '/';
      if (pathA && !pathA?.startsWith('/')) {
        pathA = '/' + pathA;
      }
      if (pathB && !pathB?.startsWith('/')) {
        pathB = '/' + pathB;
      }
      const diff = pathA.split('/').length - pathB.split('/').length;
      if (diff) {
        // If there's multiple segments in the
        // end-point, it must come first
        return diff;
      }
      // Just order the rest in DESC order, to put the dynamic
      // path params last
      return pathB.localeCompare(pathA);
    });

  for (const { controller, fullMetadata } of controllersWithMetadata) {
    if (!fullMetadata) {
      throw new Error(
        `Could resolve metadata for controller ${controller?.name}. Did you forget to put it in the controllers array?`,
      );
    }
    const {
      controller: metadata,
      body: bodyMetadata,
      params: paramsMetadata,
      response: responseMetadata,
      query: queryMetadata,
      headers: headersMetadata,
      guard: guardMetadata,
      ctx: ctxMetadata,
    } = fullMetadata;
    const instance = await injector
      .register(guardMetadata?.guards ?? [])
      .register(controller)
      .resolve(controller);
    const rawMethod = metadata.method ?? 'GET';
    const method = rawMethod.toLowerCase() as Lowercase<MethodType>;
    let endPointPath = metadata.path ?? '/';
    if (!endPointPath.startsWith('/')) {
      endPointPath = `/${endPointPath}`;
    }
    openapi.addPath(fullMetadata);

    hono[method](
      endPointPath,
      createParamValidator(paramsMetadata),
      createQueryValidator(queryMetadata),
      createBodyValidator(bodyMetadata),
      createHeaderValidator(headersMetadata),
      async (c) => {
        const args: unknown[] = [];
        if (paramsMetadata) {
          args[paramsMetadata.parameterIndex] = c.req.valid('param');
        }
        if (queryMetadata) {
          args[queryMetadata.parameterIndex] = c.req.valid('query');
        }
        if (headersMetadata) {
          args[headersMetadata.parameterIndex] = c.req.valid('header');
        }
        if (bodyMetadata) {
          args[bodyMetadata.parameterIndex] = c.req.valid('json');
        }
        if (ctxMetadata) {
          args[ctxMetadata.parameterIndex] = c;
        }
        const guards = [...globalGuards, ...(guardMetadata?.guards ?? [])];
        for (const guard of guards) {
          const guardInstance =
            typeof guard === 'function' ? await injector.resolve(guard) : guard;
          const [guardError, result] = await safeAsync(async () =>
            guardInstance.handle({
              body: c.req.valid('json'),
              c,
              headers: c.req.valid('header'),
              params: c.req.valid('param'),
              query: c.req.valid('query'),
              getClass: () => controller,
            }),
          );
          if (guardError) {
            throwInternal(guardError);
          }
          if (!result) {
            throwInternal(FORBIDDEN());
          }
        }
        const [error, response] = await safeAsync(() =>
          instance.handle(...args),
        );
        if (error) {
          throwInternal(error);
        }
        let responseParsed: unknown = response;
        if (responseMetadata) {
          const result = await responseMetadata.schema.safeParseAsync(response);
          if (!result.success) {
            throwInternal(INVALID_RESPONSE(formatZodErrorString(result.error)));
          }
          responseParsed = result.data;
          c.status(responseMetadata.statusCode);
        }
        if (!responseParsed) {
          return;
        }
        return typeof responseParsed === 'string'
          ? c.text(responseParsed)
          : c.json(responseParsed);
      },
    );
  }

  openapi.addMissingExceptions(options.extraGlobalExceptions);

  if (swaggerDocumentBuilder) {
    openapi.build(swaggerDocumentBuilder);
  }

  return {
    hono,
    injector,
  };
}
