import { Context } from 'hono';
import { Class } from 'type-fest';
import { Handler } from './handler.type.js';

export interface HandlerContext {
  params: Record<string, unknown>;
  query: Record<string, unknown>;
  headers: Record<string, unknown>;
  body?: unknown;
  c: Context;
  getClass: () => Class<Handler>;
}
