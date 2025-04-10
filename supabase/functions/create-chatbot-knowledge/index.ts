
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

    // Initialize Supabase client
    const supabaseClient = createClient(
      supabaseUrl || '',
      supabaseKey || ''
    );

    // Create the table directly with SQL - more reliable than RPC
    try {
      const { error: createTableError } = await supabaseClient.from('_sql').select(`*`, {
        head: true,
        count: 'exact',
      }).rpc('', {
        query: `
          CREATE EXTENSION IF NOT EXISTS vector;
          
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
          
          -- Function for vector matching if not exists
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
              chatbot_knowledge.id,
              chatbot_knowledge.page_id,
              chatbot_knowledge.title,
              chatbot_knowledge.content,
              chatbot_knowledge.path,
              1 - (chatbot_knowledge.embedding <=> query_embedding) AS similarity
            FROM
              chatbot_knowledge
            WHERE
              chatbot_knowledge.embedding IS NOT NULL AND
              1 - (chatbot_knowledge.embedding <=> query_embedding) > match_threshold
            ORDER BY
              chatbot_knowledge.embedding <=> query_embedding
            LIMIT
              match_count;
          END;
          $$;
        `
      });

      if (createTableError) {
        console.error("Error creating table with SQL:", createTableError);
        // Continue anyway as the table might still exist
      } else {
        console.log("Successfully created or verified table structure");
      }
    } catch (sqlError) {
      console.error("SQL execution error:", sqlError);
      // Continue as the table might already exist
    }

    // Clear existing knowledge
    try {
      console.log("Clearing existing knowledge base data");
      const { error: deleteError } = await supabaseClient
        .from('chatbot_knowledge')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) {
        console.error("Error clearing existing knowledge:", deleteError);
        // Continue anyway - if the table doesn't exist yet, this will fail but it's ok
      } else {
        console.log("Existing knowledge cleared successfully");
      }
    } catch (deleteError) {
      console.error('Error during delete operation:', deleteError);
      // Continue anyway, as we'll try to insert new data
    }

    // Prepare data for embeddings
    const pageContents = pages.map(page => {
      // Clean HTML tags and format content
      const cleanContent = (page.content || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/<!--.*?-->/g, "")
        .replace(/\s+/g, " ")
        .trim();
      
      // Extract list items if present
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

    // Process pages in batches to avoid timeouts
    const batchSize = 5;
    const successResults = [];
    const errorResults = [];

    for (let i = 0; i < pageContents.length; i += batchSize) {
      const batch = pageContents.slice(i, i + batchSize);
      console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(pageContents.length/batchSize)}`);
      
      const batchPromises = batch.map(async (page) => {
        try {
          console.log(`Creating embedding for page: ${page.title}`);
          
          // Check if OpenAI API key is available
          if (!openAIApiKey) {
            console.error("OpenAI API key is not configured");
            errorResults.push({ id: page.id, title: page.title, error: 'OpenAI API key not configured' });
            return false;
          }
          
          // Create embedding
          const embedding = await createEmbedding(page.content);
          
          if (embedding) {
            try {
              const { error } = await supabaseClient
                .from('chatbot_knowledge')
                .insert({
                  page_id: page.id,
                  title: page.title,
                  content: page.content,
                  path: page.path,
                  embedding: embedding
                });
                
              if (error) {
                console.error(`Error inserting knowledge for page ${page.id}:`, error);
                errorResults.push({ id: page.id, title: page.title, error: error.message });
                return false;
              }
              
              console.log(`Successfully processed page: ${page.title}`);
              successResults.push({ id: page.id, title: page.title });
              return true;
            } catch (insertError) {
              console.error(`Error inserting knowledge for page ${page.id}:`, insertError);
              errorResults.push({ id: page.id, title: page.title, error: insertError.message });
              return false;
            }
          } else {
            // Store content without embedding as a fallback
            try {
              const { error } = await supabaseClient
                .from('chatbot_knowledge')
                .insert({
                  page_id: page.id,
                  title: page.title,
                  content: page.content,
                  path: page.path
                  // embedding will be NULL
                });
                
              if (error) {
                console.error(`Error in fallback insert for page ${page.id}:`, error);
                errorResults.push({ id: page.id, title: page.title, error: error.message });
                return false;
              }
              
              console.log(`Stored page without embedding: ${page.title}`);
              successResults.push({ id: page.id, title: page.title });
              return true;
            } catch (insertError) {
              console.error(`Error in fallback insert for page ${page.id}:`, insertError);
              errorResults.push({ id: page.id, title: page.title, error: insertError.message });
              return false;
            }
          }
        } catch (error) {
          console.error(`Error processing page ${page.id}:`, error);
          errorResults.push({ id: page.id, title: page.title, error: error.message });
          return false;
        }
      });

      // Wait for all promises in the current batch to complete
      await Promise.all(batchPromises);
    }

    console.log(`Knowledge base update complete. Success: ${successResults.length}, Errors: ${errorResults.length}`);
    
    // Create manual entries if OpenAI failed completely
    if (successResults.length === 0 && errorResults.length > 0) {
      console.log("No pages were processed successfully. Creating basic entries without embeddings");
      
      try {
        // Manual approach: Insert basic entries without embeddings
        const manualEntries = pageContents.slice(0, 20).map(page => ({
          page_id: page.id, 
          title: page.title,
          content: page.content,
          path: page.path
        }));
        
        const { error: bulkInsertError } = await supabaseClient
          .from('chatbot_knowledge')
          .insert(manualEntries);
          
        if (bulkInsertError) {
          console.error("Bulk insert error:", bulkInsertError);
          return new Response(
            JSON.stringify({ 
              success: false,
              message: "Errore nella creazione della base di conoscenza",
              error: bulkInsertError.message 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ 
              success: true,
              message: `Creata base di conoscenza con ${manualEntries.length} pagine (senza embedding)`,
              warning: "I contenuti sono stati salvati senza embedding per problemi con OpenAI API"
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (finalError) {
        console.error("Final error in manual entry creation:", finalError);
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Errore critico nella creazione della base di conoscenza",
            error: finalError.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: successResults.length > 0,
        message: `Successfully processed ${successResults.length} out of ${pageContents.length} pages for chatbot knowledge base`,
        errors: errorResults.length,
        errorDetails: errorResults.length > 0 ? errorResults.slice(0, 3) : undefined
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
        input: text.slice(0, 8000) // Limit to 8000 characters as a safety measure
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
