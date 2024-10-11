import { HandlerContext } from '../handler-context.js';

export interface ThrottlerOptions {
  limit: number;
  ttl: number;
}

export interface ThrottlerOptionsArgs extends ThrottlerOptions {
  context: HandlerContext;
}
