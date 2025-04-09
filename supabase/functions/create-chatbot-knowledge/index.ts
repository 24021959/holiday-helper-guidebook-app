
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

    // Clear existing knowledge
    console.log("Removing existing knowledge from database");
    try {
      await supabaseClient
        .from('chatbot_knowledge')
        .delete()
        .is('id', 'not.null'); // This will delete all records
    } catch (deleteError) {
      console.error('Error deleting existing knowledge:', deleteError);
      // Continue with the insert even if delete fails
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
            await supabaseClient
              .from('chatbot_knowledge')
              .insert({
                page_id: page.id,
                title: page.title,
                content: page.content,
                path: page.path,
                embedding: embedding
              });
            successCount++;
            console.log(`Successfully processed page: ${page.title}`);
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
        message: `Successfully processed ${successCount} out of ${pages.length} pages for chatbot knowledge base`,
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
