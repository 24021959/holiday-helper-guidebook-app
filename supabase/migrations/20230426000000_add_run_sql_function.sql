
-- Create a function to run SQL commands (admin only)
CREATE OR REPLACE FUNCTION public.run_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Create a function to create the vector extension
CREATE OR REPLACE FUNCTION public.create_vector_extension()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
END;
$$;
