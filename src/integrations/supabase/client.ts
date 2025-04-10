
import { createClient } from '@supabase/supabase-js';
import type { Tables } from '@/types/database.types';

const supabaseUrl = 'https://hxozchwpuwowlsurmptr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4b3pjaHdwdXdvd2xzdXJtcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2OTkwMDAsImV4cCI6MjA1OTI3NTAwMH0.43QPJjgs3KSuZU9tDovPCabticNYympWQbeeckfnvnE';

// Enhanced client with logging for debugging
export const supabase = createClient<{ Tables: Tables }>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  },
  global: {
    fetch: (...args) => {
      // Use for debugging specific requests if needed
      return fetch(...args);
    }
  }
});

// Helper function to log errors in a standardized way
export const logSupabaseError = (operation: string, error: any) => {
  console.error(`Supabase ${operation} error:`, error);
  return error;
};

// Helper function to get a well-formatted timestamp
export const getTimestamp = () => {
  return new Date().toISOString();
};
