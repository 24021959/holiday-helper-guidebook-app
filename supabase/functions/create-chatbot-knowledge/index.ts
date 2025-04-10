
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    // Store in Supabase tables - first create the 'chatbot_knowledge' table if it doesn't exist
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Clear existing knowledge
    await supabaseClient
      .from('chatbot_knowledge')
      .delete()
      .neq('id', 0)
      .throwOnError();

    // Insert new knowledge
    for (const page of pageContents) {
      // Create embeddings using OpenAI
      const embedding = await createEmbedding(page.content);
      
      if (embedding) {
        await supabaseClient
          .from('chatbot_knowledge')
          .insert({
            page_id: page.id,
            title: page.title,
            content: page.content,
            path: page.path,
            embedding
          })
          .throwOnError();
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully processed ${pages.length} pages for chatbot knowledge base` 
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
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    return null;
  }
}

// Helper function to create Supabase client
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    from: (table: string) => ({
      select: (columns = '*') => ({
        throwOnError() {
          return this;
        },
        eq(column: string, value: any) {
          return this;
        },
        neq(column: string, value: any) {
          return this;
        },
        async then() {
          // This is a simplified version
          return { data: [] };
        }
      }),
      insert: (data: any) => ({
        async throwOnError() {
          const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey
            },
            body: JSON.stringify(data),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Supabase insert error: ${JSON.stringify(errorData)}`);
          }
          
          return await response.json();
        }
      }),
      delete: () => ({
        neq(column: string, value: any) {
          return this;
        },
        async throwOnError() {
          const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=neq.${value}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey
            },
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Supabase delete error: ${JSON.stringify(errorData)}`);
          }
          
          return;
        }
      }),
    }),
  };
}
