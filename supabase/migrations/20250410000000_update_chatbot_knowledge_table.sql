
-- Aggiorna funzioni di utilità per il chatbot

-- Funzione per verificare se è presente l'estensione vector
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

-- Funzione per verificare se una tabella esiste
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

-- Funzione per eseguire comandi SQL
CREATE OR REPLACE FUNCTION public.execute_sql(sql_command text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE sql_command;
END;
$$;

-- Funzione per calcolare la similarità tra testi (per scopi di debug)
CREATE OR REPLACE FUNCTION public.text_similarity(text1 text, text2 text)
RETURNS float
LANGUAGE plpgsql
AS $$
DECLARE
  similarity_value float;
BEGIN
  -- Usa la funzione di similarità incorporata di Postgres
  SELECT similarity(text1, text2) INTO similarity_value;
  RETURN similarity_value;
END;
$$;

-- Assicurati che la tabella chatbot_knowledge includa index per ricerche efficienti
DO $$
BEGIN
  -- Crea la tabella se non esiste
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chatbot_knowledge') THEN
    CREATE TABLE public.chatbot_knowledge (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      page_id uuid NOT NULL,
      title text NOT NULL,
      content text NOT NULL,
      path text NOT NULL,
      embedding vector(1536),
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now()
    );
    
    -- Crea indici per la ricerca
    CREATE INDEX idx_chatbot_knowledge_page_id ON public.chatbot_knowledge(page_id);
    CREATE INDEX idx_chatbot_knowledge_path ON public.chatbot_knowledge(path);
    
    -- Crea indice per la ricerca vettoriale se l'estensione vector è disponibile
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
      CREATE INDEX idx_chatbot_knowledge_embedding ON public.chatbot_knowledge USING ivfflat (embedding vector_l2_ops)
      WITH (lists = 100);
    END IF;
  END IF;
END
$$;

-- Aggiorna o crea la funzione match_documents
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE(
  id uuid,
  page_id uuid,
  title text,
  content text,
  path text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    "chatbot_knowledge"."id",
    "chatbot_knowledge"."page_id",
    "chatbot_knowledge"."title",
    "chatbot_knowledge"."content",
    "chatbot_knowledge"."path",
    1 - ("chatbot_knowledge"."embedding" <=> query_embedding) AS "similarity"
  FROM
    "chatbot_knowledge"
  WHERE
    "chatbot_knowledge"."embedding" IS NOT NULL AND
    1 - ("chatbot_knowledge"."embedding" <=> query_embedding) > match_threshold
  ORDER BY
    "chatbot_knowledge"."embedding" <=> query_embedding
  LIMIT
    match_count;
END;
$$;
