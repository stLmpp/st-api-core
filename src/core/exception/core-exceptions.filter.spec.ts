import { ArgumentsHost, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { AbstractHttpAdapter, HttpAdapterHost } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Request } from 'express';
import { mock } from 'vitest-mock-extended';

import { CoreExceptionsFilter } from './core-exceptions.filter.js';
import {
  ROUTE_NOT_FOUND,
  UNKNOWN_INTERNAL_SERVER_ERROR,
} from './core-exceptions.js';
import { exception } from './exception.js';

describe('core-exceptions.filter', () => {
  let filter: CoreExceptionsFilter;

  const abstractHttpAdapterMock = mock<AbstractHttpAdapter>();
  const httpAdapterHostMock = mock<HttpAdapterHost>({
    httpAdapter: abstractHttpAdapterMock,
  });

  beforeEach(async () => {
    vi.resetAllMocks();
    const ref = await Test.createTestingModule({
      providers: [
        CoreExceptionsFilter,
        { provide: HttpAdapterHost, useFactory: () => httpAdapterHostMock },
      ],
    }).compile();
    filter = ref.get(CoreExceptionsFilter);
  });

  it('should respond with ROUTE_NOT_FOUND', async () => {
    const unknownException = new NotFoundException('Cannot');
    const context = mock<HttpArgumentsHost>({
      getRequest: vi.fn().mockReturnValue({
        path: 'end-point/1',
      }),
      getResponse: vi.fn().mockReturnValue({}),
    });
    const host = mock<ArgumentsHost>({
      switchToHttp: vi.fn().mockReturnValue(context),
    });
    await filter.catch(unknownException, host);
    expect(abstractHttpAdapterMock.reply).toHaveBeenCalledWith(
      expect.anything(),
      ROUTE_NOT_FOUND(
        `Route not found: ${context.getRequest<Request>().path}`,
      ).toJSON(),
      HttpStatus.NOT_FOUND,
    );
  });

  it('should respond with received exception when exception is instanceof Exception', async () => {
    const unknownException = exception({
      error: 'error',
      errorCode: '0001',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
    const context = mock<HttpArgumentsHost>({
      getResponse: vi.fn().mockReturnValue({}),
    });
    const host = mock<ArgumentsHost>({
      switchToHttp: vi.fn().mockReturnValue(context),
    });
    await filter.catch(unknownException(), host);
    expect(abstractHttpAdapterMock.reply).toHaveBeenCalledWith(
      expect.anything(),
      unknownException().toJSON(),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('should respond with UNKNOWN_INTERNAL_SERVER_ERROR when exception is not recognized', async () => {
    const unknownException = new Error('123');
    const context = mock<HttpArgumentsHost>({
      getResponse: vi.fn().mockReturnValue({}),
    });
    const host = mock<ArgumentsHost>({
      switchToHttp: vi.fn().mockReturnValue(context),
    });
    await filter.catch(unknownException, host);
    expect(abstractHttpAdapterMock.reply).toHaveBeenCalledWith(
      expect.anything(),
      UNKNOWN_INTERNAL_SERVER_ERROR().toJSON(),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });
});
