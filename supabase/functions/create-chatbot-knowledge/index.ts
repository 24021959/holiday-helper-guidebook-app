
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

    // Ensure the table exists - handle potential errors gracefully
    await ensureChatbotKnowledgeTableExists(supabaseClient);

    // Clear existing knowledge only if the table exists
    try {
      console.log("Attempting to clear existing knowledge base data");
      const { error: deleteError } = await supabaseClient
        .from('chatbot_knowledge')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) {
        console.error("Error clearing existing knowledge:", deleteError);
        // Continue anyway as the table might have just been created
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
          page.list_items.map((item, index) => 
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
    let anySuccessfulEntry = false;

    for (let i = 0; i < pageContents.length; i += batchSize) {
      const batch = pageContents.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(pageContents.length/batchSize)}`);
      
      const batchPromises = batch.map(async (page) => {
        try {
          console.log(`Creating embedding for page: ${page.title}`);
          
          // Check if OpenAI API key is available
          if (!openAIApiKey) {
            console.error("OpenAI API key is not configured");
            try {
              // Store without embedding if no API key
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
              anySuccessfulEntry = true;
              return true;
            } catch (insertError) {
              console.error(`Error in fallback insert for page ${page.id}:`, insertError);
              errorResults.push({ id: page.id, title: page.title, error: insertError.message });
              return false;
            }
          }
          
          // Try to create embedding
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
                
                // Fall back to insert without embedding
                try {
                  const { error: fallbackError } = await supabaseClient
                    .from('chatbot_knowledge')
                    .insert({
                      page_id: page.id,
                      title: page.title,
                      content: page.content,
                      path: page.path
                    });
                    
                  if (fallbackError) {
                    console.error(`Fallback insert also failed for page ${page.id}:`, fallbackError);
                    errorResults.push({ id: page.id, title: page.title, error: fallbackError.message });
                    return false;
                  }
                  
                  console.log(`Stored page with fallback (no embedding): ${page.title}`);
                  successResults.push({ id: page.id, title: page.title });
                  anySuccessfulEntry = true;
                  return true;
                } catch (fallbackInsertError) {
                  console.error(`Fallback insert also failed for page ${page.id}:`, fallbackInsertError);
                  errorResults.push({ id: page.id, title: page.title, error: fallbackInsertError.message });
                  return false;
                }
              }
              
              console.log(`Successfully processed page with embedding: ${page.title}`);
              successResults.push({ id: page.id, title: page.title });
              anySuccessfulEntry = true;
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
                });
                
              if (error) {
                console.error(`Error in fallback insert for page ${page.id}:`, error);
                errorResults.push({ id: page.id, title: page.title, error: error.message });
                return false;
              }
              
              console.log(`Stored page without embedding: ${page.title}`);
              successResults.push({ id: page.id, title: page.title });
              anySuccessfulEntry = true;
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
    
    // If no pages were processed successfully, make one more manual attempt
    if (!anySuccessfulEntry) {
      console.log("No pages were processed successfully. Creating manual entries without embeddings");
      
      try {
        // Create the records one by one to identify specific issues
        let manualSuccessCount = 0;
        
        for (const page of pageContents.slice(0, 10)) {  // Limit to first 10 pages
          try {
            const { error } = await supabaseClient
              .from('chatbot_knowledge')
              .insert({
                page_id: page.id, 
                title: page.title,
                content: page.content,
                path: page.path
              });
              
            if (error) {
              console.error(`Manual insert error for page ${page.id} (${page.title}):`, error);
            } else {
              manualSuccessCount++;
              anySuccessfulEntry = true;
            }
          } catch (pageError) {
            console.error(`Manual insert exception for page ${page.id} (${page.title}):`, pageError);
          }
        }
        
        if (manualSuccessCount > 0) {
          console.log(`Successfully created ${manualSuccessCount} manual entries without embeddings`);
          return new Response(
            JSON.stringify({ 
              success: true,
              message: `Creata base di conoscenza con ${manualSuccessCount} pagine (senza embedding)`,
              warning: "I contenuti sono stati salvati senza embedding per problemi tecnici"
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error("Failed to create any entries in the knowledge base");
        }
      } catch (finalError) {
        console.error("Final error in manual entry creation:", finalError);
        
        // Last resort - try to directly execute SQL to insert at least one record
        try {
          if (pageContents.length > 0) {
            const testPage = pageContents[0];
            const insertSql = `
              INSERT INTO chatbot_knowledge (page_id, title, content, path) 
              VALUES ('${testPage.id}', '${testPage.title.replace(/'/g, "''")}', '${testPage.content.substring(0, 200).replace(/'/g, "''")}...', '${testPage.path}')
            `;
            
            const { error: sqlError } = await supabaseClient.rpc('run_sql', { sql: insertSql });
            
            if (!sqlError) {
              console.log("Created at least one record using direct SQL");
              return new Response(
                JSON.stringify({ 
                  success: true,
                  message: "Creato almeno un record nella base di conoscenza tramite SQL diretto",
                  warning: "Il processo ha incontrato problemi, ma è stato possibile salvare almeno un contenuto"
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            } else {
              console.error("SQL direct insert failed:", sqlError);
            }
          }
        } catch (sqlError) {
          console.error("Error in SQL direct insert attempt:", sqlError);
        }
        
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Errore critico nella creazione della base di conoscenza",
            error: finalError.message,
            details: "Verificare che la tabella chatbot_knowledge esista e che le permissioni siano corrette"
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

// Helper function to ensure the table exists
async function ensureChatbotKnowledgeTableExists(supabaseClient) {
  try {
    console.log("Ensuring chatbot_knowledge table exists");
    
    // First check if table exists
    const { data: checkData, error: checkError } = await supabaseClient.rpc('run_sql', {
      sql: "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chatbot_knowledge')"
    });
    
    const tableExists = checkData && checkData.length > 0 && checkData[0].exists;
    
    if (!tableExists) {
      console.log("Table doesn't exist. Creating chatbot_knowledge table");
      
      // Create table with more basic SQL first
      const createTableSql = `
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
      
      const { error: createError } = await supabaseClient.rpc('run_sql', { sql: createTableSql });
      
      if (createError) {
        console.error("Error creating table with SQL:", createError);
        throw new Error(`Failed to create chatbot_knowledge table: ${createError.message}`);
      }
      
      // Create the matching function separately
      try {
        const createFunctionSql = `
          CREATE OR REPLACE FUNCTION match_documents(
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
        `;
        
        await supabaseClient.rpc('run_sql', { sql: createFunctionSql });
      } catch (functionError) {
        console.error("Error creating match_documents function:", functionError);
        // Continue anyway - we can still insert records without the vector search function
      }
    } else {
      console.log("Table chatbot_knowledge already exists");
    }
  } catch (error) {
    console.error("Error ensuring table exists:", error);
    // We'll try to continue and hope the table actually exists
  }
}

// Helper function to create embeddings using OpenAI
async function createEmbedding(text) {
  try {
    if (!openAIApiKey) {
      console.log("OpenAI API key is not configured");
      return null;
    }
    
    console.log("Requesting embedding from OpenAI");
    
    // Limit text length to avoid token limits
    const trimmedText = text.slice(0, 8000);
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: trimmedText
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API response error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      console.error('Unexpected response format from OpenAI:', data);
      return null;
    }
    
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    return null;
  }
}
