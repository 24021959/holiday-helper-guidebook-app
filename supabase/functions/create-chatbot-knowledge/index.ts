
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
          
          -- Create a function to match documents by vector similarity
          CREATE OR REPLACE FUNCTION match_documents(
            query_embedding vector(1536),
            match_threshold float8 DEFAULT 0.5,
            match_count int DEFAULT 5
          )
          RETURNS TABLE (
            id uuid,
            page_id uuid,
            title text,
            content text,
            path text,
            similarity float8
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
            FROM chatbot_knowledge
            WHERE 1 - (chatbot_knowledge.embedding <=> query_embedding) > match_threshold
            ORDER BY similarity DESC
            LIMIT match_count;
          END;
          $$;
        `
      });
    } catch (error) {
      console.log("Table/function creation error (may already exist):", error);
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
        
        // Enhanced extraction of list items if present
        let listItemsText = "";
        if (page.list_items && Array.isArray(page.list_items) && page.list_items.length > 0) {
          listItemsText = "\n\nELEMENTI/SERVIZI DISPONIBILI:\n" + 
            page.list_items.map((item, index) => {
              const name = item.name || "";
              const description = item.description || "";
              const price = item.price ? `Prezzo: ${item.price}` : "";
              
              let itemText = `${index + 1}. ${name}`;
              if (description) itemText += `\nDescrizione: ${description}`;
              if (price) itemText += `\n${price}`;
              
              return itemText;
            }).join("\n\n");
        }

        // Enhanced content formatting with more semantic structure
        const formattedContent = `
TITOLO: ${page.title || "Senza titolo"}
URL: ${page.path || ""}

CONTENUTO PRINCIPALE:
${cleanContent}

${listItemsText}

DETTAGLI AGGIUNTIVI:
Tipo di pagina: ${page.list_type || "Pagina informativa"}
${page.is_submenu ? "Questa è una sottopagina del menu principale." : ""}
${page.parent_path ? `Pagina genitore: ${page.parent_path}` : ""}
        `.trim();

        // Add extra information based on the page path or title
        let enhancedContent = formattedContent;
        
        // Detect if this page is about reception/check-in/welcome
        if (
          page.path === "/" || 
          /reception|accoglienza|benvenuto|welcome|check[\s\-]?in/i.test(page.title) ||
          /reception|accoglienza|benvenuto|welcome|check[\s\-]?in/i.test(page.path)
        ) {
          enhancedContent += `\n\nINFORMAZIONI IMPORTANTI SULLA RECEPTION:
La reception della Locanda dell'Angelo è aperta 24 ore su 24 per garantire il massimo comfort agli ospiti.
Il personale della reception è sempre disponibile per informazioni, assistenza e richieste speciali.
Per contattare la reception dalla camera, è possibile utilizzare il telefono in camera premendo il tasto 9.`;
        }
        
        // Detect if this page is about breakfast
        if (/colazione|breakfast|prima[\s\-]?colazione/i.test(page.title) || /colazione|breakfast/i.test(page.path)) {
          if (!formattedContent.includes("orari") && !formattedContent.includes("orario")) {
            enhancedContent += `\n\nINFORMAZIONI SULLA COLAZIONE:
La colazione presso la Locanda dell'Angelo viene servita nella sala ristorante.
Gli orari della colazione sono dalle 7:30 alle 10:00. 
La colazione include una varietà di prodotti freschi e di qualità, dolci e salati.`;
          }
        }
        
        // Detect if this page is about WiFi
        if (/wifi|internet|connessione/i.test(page.title) || /wifi|internet|connessione/i.test(page.path)) {
          if (!formattedContent.includes("password") && !formattedContent.includes("gratuito")) {
            enhancedContent += `\n\nINFORMAZIONI SUL WIFI:
La Locanda dell'Angelo offre connessione WiFi gratuita in tutte le aree dell'hotel.
La password per accedere al WiFi può essere richiesta alla reception.
La rete WiFi è disponibile 24 ore su 24.`;
          }
        }

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
                input: enhancedContent.substring(0, 8000) // Prevent token limit issues
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
            content: enhancedContent,
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
