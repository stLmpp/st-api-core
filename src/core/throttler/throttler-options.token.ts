import { InjectionToken } from '@stlmpp/di';
import type { ThrottlerOptions } from './throttler.type.js';

export const ThrottlerOptionsToken = new InjectionToken<ThrottlerOptions>(
  'ThrottlerOptionsToken',
);
