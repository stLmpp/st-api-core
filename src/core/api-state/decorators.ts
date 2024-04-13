import { createParamDecorator } from '@nestjs/common';

import { getCorrelationId, getExecutionId, getTraceId } from './api-state.js';

export const CID = createParamDecorator(() => getCorrelationId());
export const TID = createParamDecorator(() => getTraceId());
export const EID = createParamDecorator(() => getExecutionId());
