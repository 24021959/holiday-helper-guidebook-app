
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

    // First, collect all pages including subpages that might not be directly included
    let allPages = [...pages];
    
    // Check if we need to fetch additional pages
    if (pages.some(page => page.is_submenu || page.path.includes('/'))) {
      try {
        // Fetch all published pages to ensure we have everything
        const { data: allPublishedPages, error: fetchError } = await supabaseClient
          .from('custom_pages')
          .select('*')
          .eq('published', true);
          
        if (!fetchError && allPublishedPages) {
          // Add any pages that weren't in the original list
          const existingPageIds = new Set(pages.map(p => p.id));
          const additionalPages = allPublishedPages.filter(p => !existingPageIds.has(p.id));
          
          if (additionalPages.length > 0) {
            console.log(`Adding ${additionalPages.length} additional pages not included in original list`);
            allPages = [...allPages, ...additionalPages];
          }
        }
      } catch (error) {
        console.error("Error fetching additional pages:", error);
      }
    }

    // Process pages and store knowledge
    let successCount = 0;
    let errorCount = 0;

    // Create a mapping of paths to pages for faster lookup when processing related pages
    const pathToPageMap = new Map();
    allPages.forEach(page => {
      pathToPageMap.set(page.path, page);
    });

    // Common/standard information to inject for frequently asked topics
    const standardInfo = {
      wifi: `La connessione WiFi è disponibile gratuitamente in tutta la Locanda dell'Angelo. 
Il nome della rete è "LocandaAngelo_WiFi" e la password è disponibile presso la reception. 
La connessione è disponibile 24/7 per tutti gli ospiti della struttura.`,
      
      reception: `La reception della Locanda dell'Angelo è aperta 24 ore su 24, 7 giorni su 7.
Il personale della reception è sempre disponibile per assistere gli ospiti con informazioni, prenotazioni o qualsiasi necessità.
Per contattare la reception dalla camera, è possibile utilizzare il telefono in camera premendo il tasto 9.`,
      
      breakfast: `La colazione presso la Locanda dell'Angelo viene servita ogni giorno nella sala ristorante.
Gli orari della colazione sono dalle 7:30 alle 10:00.
La colazione include una ricca selezione di prodotti freschi e di qualità, sia dolci che salati.`,
      
      restaurant: `Il ristorante della Locanda dell'Angelo è aperto tutti i giorni con i seguenti orari:
Pranzo: dalle 12:30 alle 14:30
Cena: dalle 19:30 alle 22:30
È consigliata la prenotazione, soprattutto nei weekend e durante l'alta stagione.
Per prenotare un tavolo, contattare la reception o il ristorante direttamente.`,
      
      minibar: `Tutte le camere della Locanda dell'Angelo sono dotate di minibar.
Il minibar contiene una selezione di bevande e snack a pagamento.
I prezzi dei prodotti sono indicati nel listino prezzi presente in camera.
Gli ospiti possono richiedere il rifornimento del minibar contattando la reception.`,
      
      bikeStorage: `Il deposito biciclette della Locanda dell'Angelo è a disposizione degli ospiti dalle 7:00 alle 22:00.
Il deposito è un'area sicura e coperta dove gli ospiti possono riporre le proprie biciclette.
Sono disponibili anche alcune attrezzature di base per piccole riparazioni di emergenza.`,
      
      checkout: `L'orario di checkout standard alla Locanda dell'Angelo è entro le ore 11:00.
È possibile richiedere un late checkout con un supplemento, soggetto a disponibilità.
Per richiedere un late checkout, si prega di contattare la reception con anticipo.`,
      
      checkin: `L'orario di check-in alla Locanda dell'Angelo è dalle 14:00 alle 22:00.
Per arrivi al di fuori di questo orario, si prega di contattare in anticipo la reception.
Al momento del check-in è richiesto un documento d'identità valido per tutti gli ospiti.`,
      
      parking: `La Locanda dell'Angelo dispone di un parcheggio privato per gli ospiti.
Il parcheggio è gratuito e disponibile fino ad esaurimento posti.
Non è necessaria la prenotazione anticipata.`
    };

    for (const page of allPages) {
      try {
        console.log(`Processing page: ${page.title} (${page.id})`);
        
        // Extract and clean HTML tags for better content processing
        let cleanContent = (page.content || "")
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

        // Get parent page information if this is a submenu
        let parentInfo = "";
        if (page.is_submenu && page.parent_path) {
          const parentPage = pathToPageMap.get(page.parent_path);
          if (parentPage) {
            parentInfo = `\nQuesta è una sottopagina di: ${parentPage.title}
Contenuto della pagina principale: ${(parentPage.content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().substring(0, 500)}...`;
          }
        }

        // Enhanced content formatting with more semantic structure
        const formattedContent = `
TITOLO: ${page.title || "Senza titolo"}
URL: ${page.path || ""}
TIPO: ${page.is_submenu ? "Sottopagina" : "Pagina principale"}
${page.parent_path ? `PAGINA GENITORE: ${page.parent_path}` : ""}

CONTENUTO PRINCIPALE:
${cleanContent}

${listItemsText}

${parentInfo}

DETTAGLI AGGIUNTIVI:
Tipo di pagina: ${page.list_type || "Pagina informativa"}
${page.is_submenu ? "Questa è una sottopagina del menu principale." : ""}
        `.trim();

        // Add extra information based on the page path or title
        let enhancedContent = formattedContent;
        
        // Detect page topics and add standard information
        const lowerTitle = (page.title || "").toLowerCase();
        const lowerPath = (page.path || "").toLowerCase();
        const lowerContent = cleanContent.toLowerCase();
        
        // Check for WiFi information
        if (
          /wifi|internet|connessione|rete/i.test(lowerTitle) || 
          /wifi|internet|connessione|rete/i.test(lowerPath) ||
          /wifi|internet|connessione/i.test(lowerContent)
        ) {
          if (!formattedContent.includes("password") && !formattedContent.includes("WiFi è gratuito")) {
            enhancedContent += `\n\nINFORMAZIONI SUL WIFI:\n${standardInfo.wifi}`;
          }
        }
        
        // Check for reception information
        if (
          /reception|accoglienza|benvenuto|check[\s\-]?in|contatt/i.test(lowerTitle) || 
          /reception|accoglienza|benvenuto|check[\s\-]?in/i.test(lowerPath) ||
          page.path === "/"
        ) {
          if (!formattedContent.includes("24 ore su 24") && !formattedContent.includes("orario reception")) {
            enhancedContent += `\n\nINFORMAZIONI SULLA RECEPTION:\n${standardInfo.reception}`;
          }
        }
        
        // Check for breakfast information
        if (
          /colazione|breakfast|prima[\s\-]?colazione/i.test(lowerTitle) || 
          /colazione|breakfast/i.test(lowerPath) ||
          /orari? colazione|breakfast time|colazione (inclus|compres)/i.test(lowerContent)
        ) {
          if (!formattedContent.includes("7:30") && !formattedContent.includes("10:00") && !formattedContent.includes("orari colazione")) {
            enhancedContent += `\n\nINFORMAZIONI SULLA COLAZIONE:\n${standardInfo.breakfast}`;
          }
        }
        
        // Check for restaurant information
        if (
          /ristorante|restaurant|pranzo|cena|mangiare/i.test(lowerTitle) || 
          /ristorante|restaurant|pranzo|cena/i.test(lowerPath) ||
          /orari? ristorante|orari? pranzo|orari? cena/i.test(lowerContent)
        ) {
          if (!formattedContent.includes("12:30") && !formattedContent.includes("19:30") && !formattedContent.includes("orari ristorante")) {
            enhancedContent += `\n\nINFORMAZIONI SUL RISTORANTE:\n${standardInfo.restaurant}`;
          }
        }
        
        // Check for minibar information
        if (
          /minibar|frigo[\s\-]?bar|mini[\s\-]?bar/i.test(lowerTitle) || 
          /minibar|frigo|mini[\s\-]?bar/i.test(lowerPath) ||
          /camera|camere|stanza|stanze/i.test(lowerTitle) && /servizi|dotazioni/i.test(lowerContent)
        ) {
          if (!formattedContent.includes("minibar") && !formattedContent.includes("frigobar")) {
            enhancedContent += `\n\nINFORMAZIONI SUL MINIBAR:\n${standardInfo.minibar}`;
          }
        }
        
        // Check for bike storage information
        if (
          /bici|biciclette|bike|ciclismo|deposito/i.test(lowerTitle) || 
          /bici|biciclette|bike|ciclismo|deposito/i.test(lowerPath)
        ) {
          if (!formattedContent.includes("deposito biciclette") && !formattedContent.includes("7:00") && !formattedContent.includes("22:00")) {
            enhancedContent += `\n\nINFORMAZIONI SUL DEPOSITO BICICLETTE:\n${standardInfo.bikeStorage}`;
          }
        }
        
        // Add standard information for all pages to ensure key information is available
        if (!enhancedContent.includes("INFORMAZIONI STANDARD")) {
          enhancedContent += `\n\nINFORMAZIONI STANDARD DELLA STRUTTURA:
- La Locanda dell'Angelo si trova in una posizione centrale e facilmente accessibile.
- La reception è aperta 24 ore su 24 e il personale è sempre disponibile per assistenza.
- La colazione viene servita dalle 7:30 alle 10:00 nella sala ristorante.
- Il check-in è disponibile dalle 14:00 alle 22:00 e il check-out è entro le 11:00.
- La connessione WiFi è gratuita in tutta la struttura.
- Tutte le camere sono dotate di minibar.
- È disponibile un deposito biciclette aperto dalle 7:00 alle 22:00.
- Il ristorante è aperto a pranzo (12:30-14:30) e a cena (19:30-22:30).
- C'è un parcheggio privato gratuito per gli ospiti.`;
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

    // As a final step, add a special "common questions" knowledge entry
    try {
      const commonQuestionsContent = `
TITOLO: Informazioni frequenti e servizi della Locanda dell'Angelo
URL: /informazioni-frequenti

CONTENUTO PRINCIPALE:
Questo documento contiene le risposte alle domande più frequenti sulla Locanda dell'Angelo.

INFORMAZIONI FREQUENTI:

RECEPTION E ORARI:
${standardInfo.reception}
${standardInfo.checkin}
${standardInfo.checkout}

SERVIZI ALIMENTARI:
${standardInfo.breakfast}
${standardInfo.restaurant}

SERVIZI IN CAMERA:
${standardInfo.minibar}
${standardInfo.wifi}

ALTRI SERVIZI:
${standardInfo.parking}
${standardInfo.bikeStorage}

Ulteriori servizi disponibili:
- Servizio in camera dalle 7:00 alle 22:00
- Lavanderia (servizio a pagamento)
- Noleggio biciclette (servizio a pagamento)
- Escursioni organizzate (da prenotare con almeno un giorno di anticipo)
- Transfer da/per aeroporto e stazione (servizio a pagamento, da prenotare in anticipo)
      `.trim();
      
      let commonQuestionsEmbedding = null;
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
              input: commonQuestionsContent.substring(0, 8000)
            }),
          });

          if (embeddingResponse.ok) {
            const embeddingData = await embeddingResponse.json();
            commonQuestionsEmbedding = embeddingData.data[0].embedding;
          }
        } catch (error) {
          console.error("Error creating embedding for common questions:", error);
        }
      }
      
      const { error } = await supabaseClient
        .from('chatbot_knowledge')
        .insert({
          page_id: '00000000-0000-0000-0000-000000000001', // Special ID for common questions
          title: "Informazioni frequenti e servizi",
          content: commonQuestionsContent,
          path: "/informazioni-frequenti",
          embedding: commonQuestionsEmbedding
        });
      
      if (error) {
        console.error("Error adding common questions:", error);
      } else {
        successCount++;
        console.log("Added common questions entry to knowledge base");
      }
    } catch (error) {
      console.error("Error adding common questions entry:", error);
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
