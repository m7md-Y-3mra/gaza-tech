'use server';

import { errorHandler } from '@/utils/error-handler';
import {
  getVerificationQueueQuery,
  getVerificationRequestByIdQuery,
  updateVerificationStatusQuery,
} from './queries';

export const getVerificationQueueAction = errorHandler(
  getVerificationQueueQuery
);

export const getVerificationRequestByIdAction = errorHandler(
  getVerificationRequestByIdQuery
);

export const updateVerificationStatusAction = errorHandler(
  updateVerificationStatusQuery
);
