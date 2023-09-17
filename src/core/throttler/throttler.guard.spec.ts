import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import {
  THROTTLER_LIMIT,
  THROTTLER_SKIP,
  THROTTLER_TTL,
} from '@nestjs/throttler/dist/throttler.constants.js';
import { mock } from 'vitest-mock-extended';

import { ThrottlerOptionsToken } from './throttler-options.token.js';
import { ThrottlerGuard } from './throttler.guard.js';
import { Throttler } from './throttler.js';
import { ThrottlerOptions, ThrottlerOptionsArgs } from './throttler.type.js';

describe('throttler.guard', () => {
  let guard: ThrottlerGuard;

  const throttlerMock = mock<Throttler>({
    rejectOnQuotaExceededOrRecordUsage: vi.fn(),
  });
  const reflectorMock = mock<Reflector>({
    getAllAndOverride: vi.fn(),
  });
  const throttlerOptionsMock = mock<ThrottlerOptions>({
    ttl: 1,
    limit: 2,
  });

  beforeEach(async () => {
    vi.resetAllMocks();
    const ref = await Test.createTestingModule({
      providers: [
        ThrottlerGuard,
        { provide: Throttler, useFactory: () => throttlerMock },
        { provide: Reflector, useFactory: () => reflectorMock },
        {
          provide: ThrottlerOptionsToken,
          useFactory: () => throttlerOptionsMock,
        },
      ],
    }).compile();
    guard = ref.get(ThrottlerGuard);
  });

  it('should create instance', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if skip', async () => {
    vi.spyOn(reflectorMock, 'getAllAndOverride').mockReturnValueOnce(true);
    const context = mock<ExecutionContext>();
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledTimes(1);
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith(
      THROTTLER_SKIP,
      expect.anything(),
    );
    expect(reflectorMock.getAllAndOverride).not.toHaveBeenCalledWith(
      THROTTLER_LIMIT,
      expect.anything(),
    );
    expect(reflectorMock.getAllAndOverride).not.toHaveBeenCalledWith(
      THROTTLER_TTL,
      expect.anything(),
    );
    expect(
      throttlerMock.rejectOnQuotaExceededOrRecordUsage,
    ).not.toHaveBeenCalled();
  });

  it('should use default ttl and limit', async () => {
    vi.spyOn(reflectorMock, 'getAllAndOverride').mockImplementation((token) =>
      new Map()
        .set(THROTTLER_SKIP, false)
        .set(THROTTLER_LIMIT, undefined)
        .set(THROTTLER_TTL, undefined)
        .get(token),
    );
    const context = mock<ExecutionContext>();
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledTimes(3);
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith(
      THROTTLER_SKIP,
      expect.anything(),
    );
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith(
      THROTTLER_LIMIT,
      expect.anything(),
    );
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith(
      THROTTLER_TTL,
      expect.anything(),
    );
    expect(
      throttlerMock.rejectOnQuotaExceededOrRecordUsage,
    ).toHaveBeenCalledWith({
      ttl: 1,
      limit: 2,
      context,
    } satisfies ThrottlerOptionsArgs);
  });

  it('should use specific ttl and limit', async () => {
    vi.spyOn(reflectorMock, 'getAllAndOverride').mockImplementation((token) =>
      new Map()
        .set(THROTTLER_SKIP, false)
        .set(THROTTLER_TTL, 3)
        .set(THROTTLER_LIMIT, 4)
        .get(token),
    );
    const context = mock<ExecutionContext>();
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledTimes(3);
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith(
      THROTTLER_SKIP,
      expect.anything(),
    );
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith(
      THROTTLER_LIMIT,
      expect.anything(),
    );
    expect(reflectorMock.getAllAndOverride).toHaveBeenCalledWith(
      THROTTLER_TTL,
      expect.anything(),
    );
    expect(
      throttlerMock.rejectOnQuotaExceededOrRecordUsage,
    ).toHaveBeenCalledWith({
      ttl: 3,
      limit: 4,
      context,
    } satisfies ThrottlerOptionsArgs);
  });
});
