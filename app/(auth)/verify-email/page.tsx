import VerifyEmail from '@/modules/auth/verify-email';
import { SearchParams } from '@/types';
import { FC } from 'react';
import { z } from 'zod';

const querySchema = z.object({
  email: z.email('Email is invalid'),
});

const VerifyEmailPage: FC<{ searchParams: Promise<SearchParams> }> = async (
  props
) => {
  const searchParams = await props.searchParams;
  const query = querySchema.parse(searchParams);
  return <VerifyEmail email={query.email} />;
};

export default VerifyEmailPage;
