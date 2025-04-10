
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

    // First make sure the vector extension is installed
    try {
      console.log("Checking if vector extension exists or installing it");
      const { error: extensionError } = await supabaseClient.rpc('run_sql', {
        sql: "CREATE EXTENSION IF NOT EXISTS vector;"
      });
      
      if (extensionError) {
        console.error("Error with vector extension:", extensionError);
        throw new Error(`Failed to ensure vector extension: ${extensionError.message}`);
      }
      
      // Create the table if it doesn't exist
      console.log("Creating chatbot_knowledge table if it doesn't exist");
      const { error: tableError } = await supabaseClient.rpc('run_sql', {
        sql: `
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
      
      if (tableError) {
        console.error("Error creating table:", tableError);
        throw new Error(`Failed to create chatbot_knowledge table: ${tableError.message}`);
      }
      
      // Create the match_documents function for vector search
      console.log("Creating match_documents function");
      const { error: functionError } = await supabaseClient.rpc('run_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION public.match_documents(
            query_embedding vector(1536),
            match_threshold float DEFAULT 0.7,
            match_count int DEFAULT 5
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
      
      if (functionError) {
        console.error("Error creating function:", functionError);
        throw new Error(`Failed to create match_documents function: ${functionError.message}`);
      }
      
      console.log("Database setup completed successfully");
    } catch (dbSetupError) {
      console.error("Database setup error:", dbSetupError);
      return new Response(
        JSON.stringify({ 
          error: `Database setup error: ${dbSetupError.message}`,
          details: "Failed to set up database objects. Check your database permissions."
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear existing knowledge
    try {
      console.log("Clearing existing knowledge base data");
      const { error: deleteError } = await supabaseClient
        .from('chatbot_knowledge')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all records
          
      if (deleteError) {
        console.error('Error deleting existing knowledge:', deleteError);
        if (deleteError.code === '42P01') {
          console.log("Table doesn't exist yet, continuing with creation");
        } else {
          throw deleteError;
        }
      } else {
        console.log("Existing knowledge cleared successfully");
      }
    } catch (deleteError) {
      console.error('Error during delete operation:', deleteError);
      // Continue anyway, as we'll try to insert new data
    }

    // Insert new knowledge with embeddings
    console.log("Creating new embeddings and inserting knowledge");
    let successCount = 0;
    let errorCount = 0;
    
    for (const page of pageContents) {
      // Create embeddings using OpenAI
      try {
        console.log(`Processing page: ${page.title}`);
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
      JSON.stringify({ 
        error: error.message,
        details: "Unexpected error occurred. Check function logs for more information."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to create embeddings using OpenAI
async function createEmbedding(text: string): Promise<number[] | null> {
  try {
    if (!openAIApiKey) {
      throw new Error("OpenAI API key is not configured");
    }
    
    console.log("Requesting embedding from OpenAI");
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API response error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      console.error('Unexpected response format from OpenAI:', data);
      throw new Error('Unexpected response format from OpenAI API');
    }
    
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    return null;
  }
}
