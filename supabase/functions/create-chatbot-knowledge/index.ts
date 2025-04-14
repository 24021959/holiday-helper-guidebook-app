
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

    // Ensure the table exists
    try {
      await supabaseClient.rpc('run_sql', {
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
    } catch (error) {
      console.log("Table creation error (may already exist):", error);
    }

    // Clear existing knowledge
    console.log("Clearing existing knowledge base data");
    try {
      await supabaseClient
        .from('chatbot_knowledge')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (clearError) {
      console.error("Error clearing existing data:", clearError);
      // Continue anyway
    }

    // Process pages and store knowledge
    let successCount = 0;
    let errorCount = 0;

    for (const page of pages) {
      try {
        console.log(`Processing page: ${page.title} (${page.id})`);
        
        // Extract and clean HTML tags for better content processing
        const cleanContent = (page.content || "")
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")    // Remove styles
          .replace(/<[^>]*>/g, " ")  // Remove HTML tags
          .replace(/<!--.*?-->/g, "") // Remove comments
          .replace(/&nbsp;/g, " ")    // Replace &nbsp; with spaces
          .replace(/\s+/g, " ")       // Replace multiple spaces with single space
          .trim();
        
        // Better extraction of list items if present
        let listItemsText = "";
        if (page.list_items && Array.isArray(page.list_items) && page.list_items.length > 0) {
          listItemsText = "\n\nElementi in questa pagina:\n" + 
            page.list_items.map((item, index) => {
              const name = item.name || "";
              const description = item.description || "";
              const price = item.price ? `Prezzo: ${item.price}` : "";
              
              return `${index + 1}. ${name} ${description} ${price}`.trim();
            }).join("\n");
        }

        // Enhanced content formatting with explicit sections
        const formattedContent = `
TITOLO PAGINA: ${page.title || "Senza titolo"}
URL PAGINA: ${page.path || ""}
CONTENUTO PRINCIPALE:
${cleanContent}
${listItemsText}

METADATI AGGIUNTIVI:
Tipo di pagina: ${page.list_type || "Pagina informativa"}
${page.is_submenu ? "Questa è una sottopagina del menu principale." : ""}
${page.parent_path ? `Pagina genitore: ${page.parent_path}` : ""}
        `.trim();

        // Create embedding if OpenAI API key is available
        let embedding = null;
        if (openAIApiKey) {
          try {
            const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: formattedContent.substring(0, 8000) // Prevent token limit issues
              }),
            });

            if (embeddingResponse.ok) {
              const embeddingData = await embeddingResponse.json();
              embedding = embeddingData.data[0].embedding;
              console.log(`Created embedding for: ${page.title}`);
            } else {
              console.error(`OpenAI API error for page ${page.id}:`, await embeddingResponse.text());
            }
          } catch (embeddingError) {
            console.error(`Error creating embedding for page ${page.id}:`, embeddingError);
          }
        }

        // Store in database
        const { error } = await supabaseClient
          .from('chatbot_knowledge')
          .insert({
            page_id: page.id,
            title: page.title || "Senza titolo",
            content: formattedContent,
            path: page.path || "",
            embedding: embedding
          });

        if (error) {
          throw error;
        }

        console.log(`Successfully processed page: ${page.title}`);
        successCount++;
      } catch (error) {
        console.error(`Error processing page ${page.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Knowledge base update complete. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        success: successCount > 0,
        message: `Elaborazione completata. ${successCount} pagine aggiunte correttamente alla base di conoscenza del chatbot.`,
        errors: errorCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-chatbot-knowledge function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Si è verificato un errore imprevisto. Controlla i log delle funzioni per ulteriori informazioni."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
