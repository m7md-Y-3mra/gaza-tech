/* eslint-disable @typescript-eslint/no-namespace */
export interface MyEnvs {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends MyEnvs { }
  }
}

export type SearchParams = { [key: string]: string | string[] | undefined }

export type TranslationFunction = (key: string) => string;
