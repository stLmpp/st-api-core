import { createParamDecorator } from '@nestjs/common';

import { getCorrelationId } from './internal-state.js';

export const CID = createParamDecorator(() => getCorrelationId());
