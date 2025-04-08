
import { createClient } from '@supabase/supabase-js';
import type { Tables } from '@/types/database.types';

const supabaseUrl = 'https://hxozchwpuwowlsurmptr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4b3pjaHdwdXdvd2xzdXJtcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2OTkwMDAsImV4cCI6MjA1OTI3NTAwMH0.43QPJjgs3KSuZU9tDovPCabticNYympWQbeeckfnvnE';

export const supabase = createClient<{ Tables: Tables }>(supabaseUrl, supabaseAnonKey);
