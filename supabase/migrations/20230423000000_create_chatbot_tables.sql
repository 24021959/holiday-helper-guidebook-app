
-- Tabella per le impostazioni del sito (se non esiste già)
CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "key" text NOT NULL,
    "value" jsonb NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    PRIMARY KEY ("id"),
    UNIQUE ("key")
);

-- Tabella per la base di conoscenza del chatbot
CREATE TABLE IF NOT EXISTS "public"."chatbot_knowledge" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "page_id" uuid NOT NULL,
    "title" text NOT NULL,
    "content" text NOT NULL,
    "path" text NOT NULL,
    "embedding" vector(1536),
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Funzione per la ricerca vettoriale
CREATE OR REPLACE FUNCTION "public"."match_documents"(
    "query_embedding" vector(1536),
    "match_threshold" float,
    "match_count" int
)
RETURNS TABLE(
    "id" uuid,
    "page_id" uuid,
    "title" text,
    "content" text,
    "path" text,
    "similarity" float
)
LANGUAGE "plpgsql"
AS $$
BEGIN
    RETURN QUERY
    SELECT
        "chatbot_knowledge"."id",
        "chatbot_knowledge"."page_id",
        "chatbot_knowledge"."title",
        "chatbot_knowledge"."content",
        "chatbot_knowledge"."path",
        1 - ("chatbot_knowledge"."embedding" <=> "query_embedding") AS "similarity"
    FROM
        "chatbot_knowledge"
    WHERE
        1 - ("chatbot_knowledge"."embedding" <=> "query_embedding") > "match_threshold"
    ORDER BY
        "chatbot_knowledge"."embedding" <=> "query_embedding"
    LIMIT
        "match_count";
END;
$$;
