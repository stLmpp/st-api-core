import { createParamDecorator } from '@nestjs/common';

import { getCorrelationId, getTraceId } from './api-state.js';

export const CID = createParamDecorator(() => getCorrelationId());
export const TID = createParamDecorator(() => getTraceId());
