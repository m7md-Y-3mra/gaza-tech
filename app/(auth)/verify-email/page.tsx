import VerifyEmail from "@/modules/auth/verify-email";
import { SearchParams } from "@/types";
import { FC } from "react";
import { z } from "zod";

const querySchema = z.object({
  email: z.email("Email is invalid"),
});

const VerifyEmailPage: FC<{ searchParams: Promise<SearchParams> }> = async (
  props
) => {
  const searchParams = await props.searchParams;
  const query = querySchema.safeParse(searchParams);
  if (query.error) {
    throw new Error("You must provide a valid email");
  }
  return <VerifyEmail email={query.data.email} />;
};

export default VerifyEmailPage;
