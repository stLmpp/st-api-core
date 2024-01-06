import { createParamDecorator } from '@nestjs/common';

import { getCorrelationId } from './api-state.js';

export const CID = createParamDecorator(() => getCorrelationId());
