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
    // return (
    //   <div className="text-center py-12">
    //     <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
    //       <AlertTriangle className="w-8 h-8 text-red-500" />
    //     </div>
    //     <h2 className="text-2xl font-bold text-foreground mb-3">
    //       No Email Provided
    //     </h2>
    //     <p className="text-muted-foreground mb-6">
    //       Please sign up first to receive a verification code.
    //     </p>
    //     <Link
    //       href="/signup"
    //       className="inline-flex items-center justify-center bg-linear-to-r from-primary to-secondary text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-200"
    //     >
    //       Go to Sign Up
    //     </Link>
    //   </div>
    // );

    throw new Error(query.error.message);
  }
  return <VerifyEmail email={query.data.email} />;
};

export default VerifyEmailPage;
