import { ThrottlerOptionsToken } from './throttler-options.token.js';
import { Throttler } from './throttler.js';
import type { ThrottlerOptions } from './throttler.type.js';
import { Inject, Injectable } from '@stlmpp/di';
import { CanActivate } from '../guard/can-activate.interface.js';
import { HandlerContext } from '../handler-context.js';
import { Throttle } from './throttle.decorator.js';

@Injectable()
export class ThrottlerGuard implements CanActivate {
  constructor(
    private readonly throttler: Throttler,
    @Inject(ThrottlerOptionsToken) private readonly options: ThrottlerOptions,
  ) {}

  async handle(context: HandlerContext): Promise<boolean> {
    const options = Throttle.getMetadata(context.getClass());

    await this.throttler.rejectOnQuotaExceededOrRecordUsage({
      ttl: options?.ttl ?? this.options.ttl,
      limit: options?.limit ?? this.options.limit,
      context,
    });
    return true;
  }
}
