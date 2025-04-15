
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Sei un assistente virtuale della Locanda dell'Angelo, una struttura ricettiva. Il tuo compito è fornire informazioni accurate e complete agli ospiti, basandoti ESCLUSIVAMENTE sulla base di conoscenza fornita.

ISTRUZIONI IMPORTANTI:
1. Rispondi SEMPRE in italiano con uno stile cordiale, professionale e dettagliato.
2. Utilizza SOLO le informazioni presenti nella base di conoscenza fornita. Se trovi informazioni rilevanti, usa quelle per dare risposte precise e complete.
3. Se NON trovi informazioni specifiche per rispondere a una domanda, NON INVENTARE. Invece rispondi: "Mi dispiace, non ho informazioni specifiche su questo argomento. Ti consiglio di chiedere direttamente alla reception, che sarà lieta di assisterti."
4. Quando rispondi, includi tutti i dettagli disponibili nella base di conoscenza relativi alla domanda, come orari, prezzi, servizi, ecc.
5. Personalizza le risposte menzionando il nome della struttura "Locanda dell'Angelo" quando appropriato.
6. Se l'utente chiede informazioni su servizi o informazioni che dovrebbero esistere in un hotel (come WiFi, ristorante, colazione), ma non sono presenti nella base di conoscenza, rispondi con la frase standard di mancanza di informazioni, non inventare.
7. Le informazioni nella base di conoscenza hanno sempre priorità assoluta su qualsiasi conoscenza generale.
8. Cerca di essere il più utile possibile, analizzando tutte le informazioni disponibili prima di rispondere che non hai informazioni.

Ricorda: il tuo scopo è assistere gli ospiti con informazioni accurate basate esclusivamente sulla base di conoscenza fornita. La precisione è fondamentale.`;

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Approx token count estimator
function estimateTokenCount(text) {
  return Math.ceil(text.length / 4);
}

// Function to truncate content if it's too long
function truncateContent(content, maxTokens = 8000) {
  if (estimateTokenCount(content) <= maxTokens) {
    return content;
  }
  
  const approxCharLimit = maxTokens * 4;
  return content.substring(0, approxCharLimit) + "... [contenuto troncato per limiti di lunghezza]";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language, chatHistory } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'No message provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Received message:", message);
    console.log("Language:", language);
    console.log("Chat history length:", chatHistory?.length || 0);

    // Initialize Supabase client
    const supabaseClient = createClient(
      supabaseUrl || '',
      supabaseKey || ''
    );

    // Get relevant documents from the knowledge base
    let relevantContent = [];
    let knowledgeBaseEmpty = false;
    
    try {
      // Check if the table exists and has content
      const { count, error: countError } = await supabaseClient
        .from('chatbot_knowledge')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error("Error checking knowledge base:", countError);
        knowledgeBaseEmpty = true;
      } else if (!count || count === 0) {
        console.log("Knowledge base is empty");
        knowledgeBaseEmpty = true;
      } else {
        console.log(`Found ${count} documents in knowledge base`);
        
        // COMPREHENSIVE SEARCH STRATEGY:
        // 1. First try using embeddings for semantic search if available
        if (openAIApiKey) {
          try {
            // Create embedding for search query
            const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: message
              }),
            });

            if (embeddingResponse.ok) {
              const embeddingData = await embeddingResponse.json();
              const embedding = embeddingData.data[0].embedding;
              
              // Search using vector similarity
              const { data: matchedDocs, error: matchError } = await supabaseClient.rpc(
                'match_documents',
                {
                  query_embedding: embedding,
                  match_threshold: 0.5,
                  match_count: 8  // Increase match count to get more potential matches
                }
              );

              if (!matchError && matchedDocs && matchedDocs.length > 0) {
                console.log(`Found ${matchedDocs.length} relevant documents using vector search`);
                relevantContent = matchedDocs;
              } else {
                console.log("No vector search results, falling back to keyword search");
              }
            }
          } catch (embeddingError) {
            console.error("Error with embedding search:", embeddingError);
          }
        }
        
        // 2. Direct keyword search for specific terms that might be in the question
        const keywordMap = {
          'wifi': ['wifi', 'internet', 'connessione', 'rete'],
          'colazione': ['colazione', 'breakfast', 'prima colazione', 'mangiare'],
          'ristorante': ['ristorante', 'cena', 'pranzo', 'mangiare', 'restaurant'],
          'reception': ['reception', 'accoglienza', 'check-in', 'check-out'],
          'camera': ['camera', 'stanza', 'room', 'alloggio'],
          'orari': ['orario', 'orari', 'aperto', 'chiuso', 'apre', 'chiude', 'disponibile'],
          'servizi': ['servizio', 'servizi', 'facilities', 'service'],
          'parcheggio': ['parcheggio', 'parking', 'auto', 'macchina'],
          'biciclette': ['bici', 'biciclette', 'bicycle', 'bike', 'ciclabile'],
          'bar': ['bar', 'drink', 'bevande', 'aperitivo'],
          'pagamento': ['pagamento', 'pagare', 'costo', 'prezzo', 'payment', 'carta', 'contanti'],
          'prenotazione': ['prenotazione', 'prenotare', 'booking', 'reserve', 'reservation']
        };
        
        // Check if the message contains any keywords of interest
        const lowercaseMessage = message.toLowerCase();
        const matchedCategories = [];
        
        for (const [category, keywords] of Object.entries(keywordMap)) {
          if (keywords.some(keyword => lowercaseMessage.includes(keyword))) {
            matchedCategories.push(category);
          }
        }
        
        // If we have categories, search for them specifically
        if (matchedCategories.length > 0) {
          console.log("Detected specific categories in question:", matchedCategories);
          const additionalKeywords = matchedCategories.flatMap(category => keywordMap[category]);
          
          // Build a comprehensive search with all relevant keywords for the categories
          if (additionalKeywords.length > 0) {
            try {
              const searchConditions = additionalKeywords.map(term => `content.ilike.%${term}%`);
              
              const { data: categoryMatches, error: categoryError } = await supabaseClient
                .from('chatbot_knowledge')
                .select('*')
                .or(searchConditions.join(','))
                .limit(10);
                
              if (!categoryError && categoryMatches && categoryMatches.length > 0) {
                console.log(`Found ${categoryMatches.length} documents related to specific categories`);
                
                // Add only new documents not already in relevantContent
                const existingIds = new Set(relevantContent.map(doc => doc.id));
                const newCategoryMatches = categoryMatches.filter(doc => !existingIds.has(doc.id));
                
                relevantContent = [...relevantContent, ...newCategoryMatches];
                console.log(`Combined relevant content now has ${relevantContent.length} documents`);
              }
            } catch (error) {
              console.error("Error in category search:", error);
            }
          }
        }
        
        // 3. If still limited or no results, perform a general keyword search from the message
        if (relevantContent.length < 3) {
          const cleanedMessage = message.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
            .replace(/\s{2,}/g, " ")
            .trim();
            
          const searchTerms = cleanedMessage.split(/\s+/)
            .filter(term => term.length > 2 && !['che', 'come', 'cosa', 'dove', 'chi', 'quando', 'perché', 'alla', 'della'].includes(term))
            .slice(0, 10);  // Use more search terms
            
          console.log("General search terms:", searchTerms);
          
          if (searchTerms.length > 0) {
            // Try more flexible search with OR conditions
            let searchConditions = [];
            
            for (const term of searchTerms) {
              searchConditions.push(`content.ilike.%${term}%`);
            }
            
            const { data: keywordMatches, error: keywordError } = await supabaseClient
              .from('chatbot_knowledge')
              .select('*')
              .or(searchConditions.join(','))
              .limit(10);
              
            if (!keywordError && keywordMatches && keywordMatches.length > 0) {
              console.log(`Found ${keywordMatches.length} documents using keyword search`);
              
              // Combine results if we already have some from embedding search
              if (relevantContent.length > 0) {
                // Filter out duplicates
                const existingIds = new Set(relevantContent.map(doc => doc.id));
                const uniqueKeywordMatches = keywordMatches.filter(doc => !existingIds.has(doc.id));
                
                relevantContent = [...relevantContent, ...uniqueKeywordMatches];
                console.log(`Combined results: ${relevantContent.length} documents`);
              } else {
                relevantContent = keywordMatches;
              }
            } else {
              console.log("No keyword search results, trying another approach");
              
              // Try a more aggressive search by searching each term individually
              if (relevantContent.length === 0) {
                const allResults = [];
                
                for (const term of searchTerms) {
                  if (term.length < 3) continue;
                  
                  const { data: termMatches, error: termError } = await supabaseClient
                    .from('chatbot_knowledge')
                    .select('*')
                    .ilike('content', `%${term}%`)
                    .limit(3);
                    
                  if (!termError && termMatches && termMatches.length > 0) {
                    allResults.push(...termMatches);
                  }
                }
                
                // Remove duplicates
                const uniqueIds = new Set();
                const uniqueResults = [];
                
                for (const doc of allResults) {
                  if (!uniqueIds.has(doc.id)) {
                    uniqueIds.add(doc.id);
                    uniqueResults.push(doc);
                  }
                }
                
                if (uniqueResults.length > 0) {
                  console.log(`Found ${uniqueResults.length} documents using individual term search`);
                  relevantContent = uniqueResults;
                } else {
                  console.log("No individual term search results, using most recent documents");
                }
              }
            }
          }
        }
        
        // 4. If still no results, get some general documents as context
        if (relevantContent.length === 0) {
          // Fetch home page content or general information
          const { data: generalDocs, error: generalError } = await supabaseClient
            .from('chatbot_knowledge')
            .select('*')
            .or('path.eq./,title.ilike.%welcome%,title.ilike.%benvenuto%,title.ilike.%hotel%,title.ilike.%locanda%')
            .limit(5);
            
          if (!generalError && generalDocs && generalDocs.length > 0) {
            console.log(`Using ${generalDocs.length} general documents as context`);
            relevantContent = generalDocs;
          } else {
            // Last resort: get the most recent documents
            const { data: recentDocs, error: recentError } = await supabaseClient
              .from('chatbot_knowledge')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(5);
              
            if (!recentError && recentDocs && recentDocs.length > 0) {
              console.log(`Using ${recentDocs.length} most recent documents as context`);
              relevantContent = recentDocs;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error accessing knowledge base:", error);
      relevantContent = [];
    }

    if (!openAIApiKey) {
      console.error("OpenAI API key not found");
      return new Response(
        JSON.stringify({ 
          response: "Mi dispiace, il servizio di assistenza non è disponibile al momento. Riprova più tardi o contatta direttamente la reception." 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format the chat history
    const formattedHistory = chatHistory ? chatHistory
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      .slice(-6) : [];  // Include last 6 messages for better context

    // Create context from knowledge base
    let knowledgeContext = "";
    if (knowledgeBaseEmpty) {
      knowledgeContext = "ATTENZIONE: La base di conoscenza è vuota. Non sono disponibili informazioni specifiche sulla struttura Locanda dell'Angelo.";
    } else if (relevantContent.length > 0) {
      // Score documents by relevance and order them
      const scoredDocuments = relevantContent.map(doc => {
        // Simple scoring based on content length and title match
        let score = 5;  // Base score
        
        // Title matches add more weight
        const lowerTitle = doc.title.toLowerCase();
        const lowerMessage = message.toLowerCase();
        
        // Check for exact key phrases
        if (lowerMessage.includes('wifi') && lowerTitle.includes('wifi')) score += 15;
        if (lowerMessage.includes('colazione') && lowerTitle.includes('colazione')) score += 15;
        if (lowerMessage.includes('ristorante') && lowerTitle.includes('ristorante')) score += 15;
        if (lowerMessage.includes('reception') && lowerTitle.includes('reception')) score += 15;
        if (lowerMessage.includes('camera') && lowerTitle.includes('camera')) score += 15;
        if (lowerMessage.includes('orari') && (lowerTitle.includes('orari') || lowerTitle.includes('orario'))) score += 15;
        if (lowerMessage.includes('biciclette') && (lowerTitle.includes('bici') || lowerTitle.includes('biciclette'))) score += 15;
        if (lowerMessage.includes('parcheggio') && lowerTitle.includes('parcheggio')) score += 15;
        
        // Keywords in content
        const content = doc.content.toLowerCase();
        const messageWords = lowerMessage.split(/\s+/).filter(w => w.length > 3);
        
        for (const word of messageWords) {
          const matches = (content.match(new RegExp(word, 'g')) || []).length;
          score += matches * 2;  // 2 points per keyword match
        }
        
        return { ...doc, score };
      }).sort((a, b) => b.score - a.score);
      
      // Use scored and ordered documents
      knowledgeContext = "### INFORMAZIONI DALLA BASE DI CONOSCENZA DELLA LOCANDA DELL'ANGELO:\n\n" + 
        scoredDocuments.map(doc => {
          // Create a more structured format
          const truncatedContent = truncateContent(doc.content, 2000);
          return `DOCUMENTO: ${doc.title}\nURL: ${doc.path}\n\nCONTENUTO:\n${truncatedContent}\n`;
        }).join("\n\n---\n\n");
      
      // Final safety check - truncate the entire context if still too large
      knowledgeContext = truncateContent(knowledgeContext, 6000);
    } else {
      knowledgeContext = "ATTENZIONE: Non sono state trovate informazioni pertinenti nella base di conoscenza per rispondere alla domanda dell'utente.";
    }

    const promptWithContext = `${knowledgeContext}\n\nDOMANDA DELL'UTENTE: ${message}\n\nRispondi alla domanda dell'utente in italiano utilizzando SOLO le informazioni fornite sopra dalla base di conoscenza. Se non trovi informazioni specifiche per rispondere, NON INVENTARE ma rispondi che non hai quella informazione specifica e suggerisci di contattare la reception. Cerca di essere il più possibile preciso ed esaustivo utilizzando le informazioni disponibili.`;
    
    console.log("Number of relevant documents used for context:", relevantContent.length);
    
    // Call OpenAI for a response
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...formattedHistory,
          { role: 'user', content: promptWithContext }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const chatbotResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: chatbotResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chatbot function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "Mi dispiace, si è verificato un errore durante l'elaborazione della tua richiesta. Riprova più tardi o contatta direttamente la reception per assistenza."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
