
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

    // Prepare data for embeddings, extracting content from each page
    const pageContents = pages.map(page => {
      // Simple formatting of the page content
      const formattedContent = `Page: ${page.title}\nURL: ${page.path}\nContent: ${
        (page.content || "").replace(/<[^>]*>/g, " ").trim()
      }`;

      return {
        id: page.id,
        title: page.title,
        content: formattedContent,
        path: page.path
      };
    });

    // Initialize Supabase client
    const supabaseClient = createClient(
      supabaseUrl || '',
      supabaseKey || ''
    );

    // Clear existing knowledge
    try {
      await supabaseClient
        .from('chatbot_knowledge')
        .delete()
        .is('id', 'not.null'); // This will delete all records
    } catch (deleteError) {
      console.error('Error deleting existing knowledge:', deleteError);
      // Continue with the insert even if delete fails
    }

    // Insert new knowledge
    let successCount = 0;
    for (const page of pageContents) {
      // Create embeddings using OpenAI
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
              embedding
            });
          successCount++;
        } catch (insertError) {
          console.error(`Error inserting knowledge for page ${page.id}:`, insertError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully processed ${successCount} out of ${pages.length} pages for chatbot knowledge base` 
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
