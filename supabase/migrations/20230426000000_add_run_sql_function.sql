
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

-- Function to check if the vector extension exists
CREATE OR REPLACE FUNCTION public.check_vector_extension()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  extension_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM pg_extension 
    WHERE extname = 'vector'
  ) INTO extension_exists;
  
  RETURN extension_exists;
END;
$$;

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION public.table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  does_exist BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  ) INTO does_exist;
  
  RETURN does_exist;
END;
$$;
