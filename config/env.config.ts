import { getEnvOrThrow } from "@/utils/env.utils";

export const SUPABASE_URL = getEnvOrThrow("NEXT_PUBLIC_SUPABASE_URL");
export const SUPABASE_ANON_KEY = getEnvOrThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY");