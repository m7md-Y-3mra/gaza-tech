import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const createClient = () =>
  createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
