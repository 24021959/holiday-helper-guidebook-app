
-- Add utility functions for chatbot knowledge base

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION public.table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  found boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = table_name
  ) INTO found;
  
  RETURN found;
END;
$$;

-- Function to execute SQL commands
CREATE OR REPLACE FUNCTION public.execute_sql(sql_command text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE sql_command;
END;
$$;

-- Function to check if vector extension exists
CREATE OR REPLACE FUNCTION public.check_vector_extension()
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  found boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_extension
    WHERE extname = 'vector'
  ) INTO found;
  
  RETURN found;
END;
$$;

-- Create a container function for other utility functions
CREATE OR REPLACE FUNCTION public.create_utility_functions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Add any additional utility functions here
  NULL;
END;
$$;
