
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Add utility functions to check database status
async function checkExtension(client: any, extension: string): Promise<boolean> {
  try {
    const { data, error } = await client.from('pg_extension')
      .select('extname')
      .eq('extname', extension)
      .maybeSingle();
    
    if (error) {
      console.error(`Error checking if extension ${extension} exists:`, error);
      return false;
    }
    
    return !!data;
  } catch (e) {
    console.error(`Exception checking extension ${extension}:`, e);
    return false;
  }
}

async function ensureDatabaseSetup(client: any): Promise<{ success: boolean; error?: string }> {
  try {
    // Create utility functions for checking database state
    try {
      await client.rpc('create_utility_functions', {});
      console.log("Created utility functions successfully");
    } catch (error) {
      console.log("Error creating utility functions or they already exist:", error);
      // Continue as these might already exist
    }
    
    // Check if vector extension exists, create if not
    const hasVectorExtension = await checkExtension(client, 'vector');
    console.log("Vector extension exists:", hasVectorExtension);
    
    if (!hasVectorExtension) {
      try {
        // Try to create the extension directly
        await client.rpc('execute_sql', {
          sql_command: "CREATE EXTENSION IF NOT EXISTS vector;"
        });
        console.log("Vector extension created successfully");
      } catch (error) {
        console.error("Error creating vector extension:", error);
        return { 
          success: false, 
          error: `Failed to create vector extension: ${error.message || JSON.stringify(error)}` 
        };
      }
    }
    
    // Check if the chatbot_knowledge table exists, create if not
    try {
      const { data: tableExists, error: tableCheckError } = await client.rpc('table_exists', {
        table_name: 'chatbot_knowledge'
      });
      
      if (tableCheckError) {
        console.error("Error checking if table exists:", tableCheckError);
        return { 
          success: false, 
          error: `Failed to check if table exists: ${tableCheckError.message}` 
        };
      }
      
      if (!tableExists) {
        // Create the table
        await client.rpc('execute_sql', {
          sql_command: `
            CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              page_id uuid NOT NULL,
              title text NOT NULL,
              content text NOT NULL,
              path text NOT NULL,
              embedding vector(1536),
              created_at timestamp with time zone DEFAULT now(),
              updated_at timestamp with time zone DEFAULT now()
            );
          `
        });
        console.log("chatbot_knowledge table created successfully");
      } else {
        console.log("chatbot_knowledge table already exists");
      }
      
      // Create the match_documents function
      await client.rpc('execute_sql', {
        sql_command: `
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
              1 - ("chatbot_knowledge"."embedding" <=> query_embedding) > match_threshold
            ORDER BY
              "chatbot_knowledge"."embedding" <=> query_embedding
            LIMIT
              match_count;
          END;
          $$;
        `
      });
      console.log("match_documents function created or updated successfully");
      
      return { success: true };
    } catch (error) {
      console.error("Error setting up database objects:", error);
      return { 
        success: false, 
        error: `Failed to set up database objects: ${error.message || JSON.stringify(error)}` 
      };
    }
  } catch (error) {
    console.error("Error in database setup:", error);
    return { 
      success: false, 
      error: `General error in database setup: ${error.message || JSON.stringify(error)}` 
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pages } = await req.json();

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No pages provided or invalid format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${pages.length} pages for chatbot knowledge base`);

    // Initialize Supabase client
    const supabaseClient = createClient(
      supabaseUrl || '',
      supabaseKey || ''
    );

    // First create the necessary database functions
    try {
      await supabaseClient.rpc('execute_sql', {
        sql_command: `
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
        `
      });

      await supabaseClient.rpc('execute_sql', {
        sql_command: `
          CREATE OR REPLACE FUNCTION public.execute_sql(sql_command text)
          RETURNS void
          LANGUAGE plpgsql
          AS $$
          BEGIN
            EXECUTE sql_command;
          END;
          $$;
        `
      });

      await supabaseClient.rpc('execute_sql', {
        sql_command: `
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
        `
      });

      await supabaseClient.rpc('execute_sql', {
        sql_command: `
          CREATE OR REPLACE FUNCTION public.create_utility_functions()
          RETURNS void
          LANGUAGE plpgsql
          AS $$
          BEGIN
            -- Add any additional utility functions here
            NULL;
          END;
          $$;
        `
      });
      
      console.log("Created database utility functions");
    } catch (error) {
      console.error("Error creating database functions, they might already exist:", error);
      // Continue as these might already exist
    }

    // Ensure database is set up correctly
    const dbSetupResult = await ensureDatabaseSetup(supabaseClient);
    if (!dbSetupResult.success) {
      return new Response(
        JSON.stringify({ 
          error: dbSetupResult.error || "Failed to set up database properly" 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for embeddings, processing and formatting content from each page
    const pageContents = pages.map(page => {
      // Clean HTML tags and format content
      const cleanContent = (page.content || "").replace(/<[^>]*>/g, " ").trim();
      
      // Extract any list items if present
      let listItemsText = "";
      if (page.list_items && Array.isArray(page.list_items) && page.list_items.length > 0) {
        listItemsText = "\n\nItems in this page:\n" + 
          page.list_items.map((item: any, index: number) => 
            `${index + 1}. ${item.name || ""} - ${item.description || ""}`
          ).join("\n");
      }

      // Format the content in a way that's useful for the chatbot
      const formattedContent = `
Page Title: ${page.title || "Untitled"}
URL Path: ${page.path || ""}
Content: ${cleanContent}${listItemsText}
      `.trim();

      return {
        id: page.id,
        title: page.title || "Untitled",
        content: formattedContent,
        path: page.path || ""
      };
    });

    // Clear existing knowledge
    try {
      const { error: deleteError } = await supabaseClient
        .from('chatbot_knowledge')
        .delete()
        .is('id', 'not.null'); // This will delete all records
          
      if (deleteError) {
        console.error('Error deleting existing knowledge:', deleteError);
        return new Response(
          JSON.stringify({ error: "Failed to clear existing knowledge: " + deleteError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log("Existing knowledge cleared successfully");
    } catch (deleteError) {
      console.error('Error deleting existing knowledge:', deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to clear existing knowledge: " + deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert new knowledge with embeddings
    console.log("Creating new embeddings and inserting knowledge");
    let successCount = 0;
    let errorCount = 0;
    
    for (const page of pageContents) {
      // Create embeddings using OpenAI
      try {
        const embedding = await createEmbedding(page.content);
        
        if (embedding) {
          try {
            const { error: insertError } = await supabaseClient
              .from('chatbot_knowledge')
              .insert({
                page_id: page.id,
                title: page.title,
                content: page.content,
                path: page.path,
                embedding: embedding
              });
              
            if (insertError) {
              console.error(`Error inserting knowledge for page ${page.id}:`, insertError);
              errorCount++;
            } else {
              successCount++;
              console.log(`Successfully processed page: ${page.title}`);
            }
          } catch (insertError) {
            console.error(`Error inserting knowledge for page ${page.id}:`, insertError);
            errorCount++;
          }
        } else {
          console.error(`Failed to create embedding for page ${page.id}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error processing page ${page.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Knowledge base update complete. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully processed ${successCount} out of ${pageContents.length} pages for chatbot knowledge base`,
        errors: errorCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-chatbot-knowledge function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to create embeddings using OpenAI
async function createEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000) // Limit to 8000 characters
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI embedding API error:', data);
      throw new Error(`OpenAI embedding API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    return null;
  }
}
