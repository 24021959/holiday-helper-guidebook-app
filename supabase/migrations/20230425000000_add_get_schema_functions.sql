
-- Create a utility function to list available functions in the schema
CREATE OR REPLACE FUNCTION public.get_schema_functions()
RETURNS TABLE (
  schema_name TEXT,
  function_name TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
    SELECT n.nspname::TEXT as schema_name, p.proname::TEXT as function_name
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public';
END;
$$;
