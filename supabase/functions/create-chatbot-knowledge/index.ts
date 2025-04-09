
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

    // Initialize Supabase client
    const supabaseClient = createClient(
      supabaseUrl || '',
      supabaseKey || ''
    );

    // First, check if the vector extension exists
    let vectorExtensionExists = false;
    try {
      const { data: extensionData, error: extensionError } = await supabaseClient
        .rpc('check_vector_extension');
        
      if (extensionError) {
        console.log("Error checking vector extension:", extensionError);
        console.log("Will attempt to create extension");
      } else {
        vectorExtensionExists = !!extensionData;
        console.log("Vector extension exists:", vectorExtensionExists);
      }
    } catch (extErr) {
      console.log("Exception checking vector extension:", extErr);
    }
    
    // Create vector extension if it doesn't exist
    if (!vectorExtensionExists) {
      try {
        const { data: createExtensionData, error: createExtensionError } = await supabaseClient
          .rpc('create_vector_extension');
          
        if (createExtensionError) {
          console.log("Error creating vector extension:", createExtensionError);
        } else {
          console.log("Vector extension created successfully");
          vectorExtensionExists = true;
        }
      } catch (createExtErr) {
        console.log("Exception creating vector extension:", createExtErr);
      }
    }

    // Check if the chatbot_knowledge table exists
    let tableExists = false;
    try {
      const { data: tableData, error: tableError } = await supabaseClient
        .rpc('table_exists', { table_name: 'chatbot_knowledge' });
        
      if (tableError) {
        console.log("Error checking if table exists:", tableError);
      } else {
        tableExists = !!tableData;
        console.log("chatbot_knowledge table exists:", tableExists);
      }
    } catch (tableErr) {
      console.log("Exception checking table:", tableErr);
    }
    
    // Create the table if it doesn't exist
    if (!tableExists) {
      try {
        console.log("Creating chatbot_knowledge table");
        const createTableQuery = `
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
        `;
        
        const { error: createTableError } = await supabaseClient
          .rpc('run_sql', { sql: createTableQuery });
          
        if (createTableError) {
          console.log("Error creating table:", createTableError);
        } else {
          console.log("Table created successfully");
          tableExists = true;
        }
        
        // Create match_documents function
        console.log("Creating match_documents function");
        const createFunctionQuery = `
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
        `;
        
        const { error: createFunctionError } = await supabaseClient
          .rpc('run_sql', { sql: createFunctionQuery });
          
        if (createFunctionError) {
          console.log("Error creating function:", createFunctionError);
        } else {
          console.log("Function created successfully");
        }
        
      } catch (createErr) {
        console.error("Error creating database objects:", createErr);
      }
    }

    // If the table exists but we didn't just create it, make sure the match_documents function exists
    if (tableExists && vectorExtensionExists) {
      try {
        // Check if the match_documents function exists by trying to call it with parameters
        const testQuery = {
          query_embedding: Array(1536).fill(0),
          match_threshold: 0.5,
          match_count: 1
        };
        
        const { data: functionTestData, error: functionTestError } = await supabaseClient
          .rpc('match_documents', testQuery);
          
        if (functionTestError && functionTestError.code === 'PGRST202') {
          console.log("match_documents function doesn't exist or has wrong parameters, creating it");
          
          // Create match_documents function
          const createFunctionQuery = `
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
          `;
          
          const { error: createFunctionError } = await supabaseClient
            .rpc('run_sql', { sql: createFunctionQuery });
            
          if (createFunctionError) {
            console.log("Error creating function:", createFunctionError);
          } else {
            console.log("Function created successfully");
          }
        } else {
          console.log("match_documents function exists and works correctly");
        }
      } catch (functionErr) {
        console.log("Exception checking/creating function:", functionErr);
      }
    }

    // Clear existing knowledge
    if (tableExists) {
      console.log("Removing existing knowledge from database");
      try {
        const { error: deleteError } = await supabaseClient
          .from('chatbot_knowledge')
          .delete()
          .is('id', 'not.null'); // This will delete all records
          
        if (deleteError) {
          console.error('Error deleting existing knowledge:', deleteError);
        }
      } catch (deleteError) {
        console.error('Error deleting existing knowledge:', deleteError);
      }
    }

    // Insert new knowledge with embeddings
    console.log("Creating new embeddings and inserting knowledge");
    let successCount = 0;
    let errorCount = 0;
    
    if (!tableExists || !vectorExtensionExists) {
      return new Response(
        JSON.stringify({ 
          error: "Database setup is incomplete. Table exists: " + tableExists + ", Vector extension exists: " + vectorExtensionExists 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
      JSON.stringify({ error: error.message }),
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
