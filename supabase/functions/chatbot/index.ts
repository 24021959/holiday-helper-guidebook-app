
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Sei un assistente virtuale specializzato della Locanda dell'Angelo, una struttura ricettiva in Italia. Il tuo compito è fornire informazioni accurate e dettagliate agli ospiti, basandoti sui contenuti della base di conoscenza fornita.

ISTRUZIONI IMPORTANTI:
1. Rispondi SEMPRE in italiano con uno stile cordiale, professionale e dettagliato.
2. Quando un utente fa una domanda, analizza attentamente tutte le informazioni disponibili nella base di conoscenza prima di rispondere.
3. Utilizza ESCLUSIVAMENTE le informazioni presenti nella base di conoscenza fornita. Non inventare mai informazioni o dettagli che non sono esplicitamente menzionati.
4. Quando fornisci una risposta, includi tutti i dettagli pertinenti come: orari, prezzi, localizzazioni, restrizioni e qualsiasi altra informazione utile.
5. Personalizza sempre le tue risposte facendo riferimento alla "Locanda dell'Angelo" per creare un'esperienza personalizzata.
6. Se una domanda riguarda un servizio tipico per un hotel (come WiFi, colazione, check-in), ma non trovi informazioni specifiche, verifica nella sezione "INFORMAZIONI STANDARD" che è stata aggiunta a molti documenti.
7. Se dopo aver cercato ovunque, non trovi alcuna informazione pertinente per rispondere alla domanda, rispondi: "Mi dispiace, non ho informazioni specifiche su questo argomento. Ti consiglio di contattare direttamente la reception, che sarà lieta di assisterti."

PRIORITÀ NELLE INFORMAZIONI:
1. Informazioni specifiche trovate direttamente nei documenti della base di conoscenza
2. Informazioni standard fornite nella sezione "INFORMAZIONI STANDARD" 
3. Informazioni generali che si applicano a tutti gli hotel solo se chiaramente pertinenti e non contraddicono nulla nella base di conoscenza

Ricorda: il tuo obiettivo è aiutare gli ospiti a godere al massimo del loro soggiorno alla Locanda dell'Angelo fornendo informazioni accurate e utili.`;

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

    // Definizione delle query più comuni che potrebbero essere fatte dall'utente
    const commonQueries = {
      wifi: ["wifi", "internet", "connessione", "password wifi", "rete", "connessione internet"],
      colazione: ["colazione", "breakfast", "prima colazione", "orari colazione", "quando si fa colazione"],
      reception: ["reception", "accoglienza", "check-in", "check-out", "orari reception", "banco"],
      ristorante: ["ristorante", "restaurant", "cena", "pranzo", "mangiare", "orari ristorante", "orari pasti"],
      camere: ["camera", "camere", "stanza", "stanze", "alloggio", "dormire", "servizi in camera"],
      minibar: ["minibar", "mini bar", "frigobar", "frigo", "bevande camera"],
      orari: ["orario", "orari", "tempo", "quando", "a che ora"],
      deposito: ["deposito", "biciclette", "bici", "bike", "deposito biciclette"],
      parcheggio: ["parcheggio", "parking", "auto", "macchina", "dove parcheggiare"],
      pagamento: ["pagamento", "pagare", "costo", "prezzo", "carta di credito", "contanti"],
      servizi: ["servizi", "facilities", "offerte", "cosa offrite", "servizi hotel"],
      checkin: ["check in", "checkin", "check-in", "arrivo", "quando posso arrivare"],
      checkout: ["check out", "checkout", "check-out", "partenza", "lasciare la stanza"]
    };

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

        // Extract keyphrases from the query to improve search relevance
        const cleanMessage = message.toLowerCase()
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();
          
        // Use embeddings for semantic search if available
        let foundRelevantContent = false;
        
        // 1. FIRST SEARCH STRATEGY: Vector similarity search (semantic search)
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
              
              // Use a relatively low threshold to catch more potentially relevant documents
              const { data: matchedDocs, error: matchError } = await supabaseClient.rpc(
                'match_documents',
                {
                  query_embedding: embedding,
                  match_threshold: 0.5,
                  match_count: 10  // Get more documents to ensure we have comprehensive information
                }
              );

              if (!matchError && matchedDocs && matchedDocs.length > 0) {
                console.log(`Found ${matchedDocs.length} relevant documents using vector search`);
                // Sort by similarity score
                matchedDocs.sort((a, b) => b.similarity - a.similarity);
                relevantContent = matchedDocs;
                foundRelevantContent = true;
              } else {
                console.log("No vector search results, falling back to keyword search");
              }
            } else {
              console.error("OpenAI API response error:", embeddingResponse.status);
            }
          } catch (embeddingError) {
            console.error("Error with embedding search:", embeddingError);
          }
        }
        
        // 2. SECOND SEARCH STRATEGY: Check if the query matches any common query types
        // This helps with functional categorization of queries
        if (!foundRelevantContent || relevantContent.length < 3) {
          console.log("Checking for common query types...");
          
          let matchedCategories = [];
          for (const [category, keywords] of Object.entries(commonQueries)) {
            if (keywords.some(keyword => cleanMessage.includes(keyword))) {
              matchedCategories.push(category);
            }
          }
          
          if (matchedCategories.length > 0) {
            console.log("Query matches these categories:", matchedCategories);
            
            // Gather keywords from all matched categories
            const searchKeywords = matchedCategories.flatMap(category => commonQueries[category]);
            
            // Create a query with OR conditions for all the keywords
            const queries = searchKeywords.map(keyword => {
              return `content.ilike.%${keyword}%`;
            });
            
            const { data: categoryMatches, error: categoryError } = await supabaseClient
              .from('chatbot_knowledge')
              .select('*')
              .or(queries.join(','))
              .limit(10);
              
            if (!categoryError && categoryMatches && categoryMatches.length > 0) {
              console.log(`Found ${categoryMatches.length} documents matching common categories`);
              
              if (foundRelevantContent) {
                // Add new documents only if they're not already included
                const existingIds = new Set(relevantContent.map(doc => doc.id));
                const newDocs = categoryMatches.filter(doc => !existingIds.has(doc.id));
                relevantContent = [...relevantContent, ...newDocs];
              } else {
                relevantContent = categoryMatches;
                foundRelevantContent = true;
              }
            }
          }
        }
        
        // 3. THIRD SEARCH STRATEGY: Direct content search with extracted keywords
        if (!foundRelevantContent || relevantContent.length < 3) {
          console.log("Performing direct keyword search...");
          
          // Extract significant words (exclude very common short words)
          const excludeWords = new Set([
            'a', 'e', 'i', 'o', 'u', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 
            'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'che', 'chi', 'cui', 
            'non', 'sì', 'ho', 'hai', 'ha', 'mi', 'ti', 'ci', 'vi', 'al', 'del', 'dal', 'nel', 
            'sul', 'dall', 'dell', 'all'
          ]);
          
          const words = cleanMessage.split(/\s+/)
            .filter(word => word.length > 2 && !excludeWords.has(word))
            .slice(0, 15); // Limit number of keywords to avoid overly broad queries
            
          console.log("Search keywords:", words);
          
          if (words.length > 0) {
            // Build a query that will match any of these keywords
            const wordQueries = words.map(word => `content.ilike.%${word}%`);
            
            try {
              const { data: keywordMatches, error: keywordError } = await supabaseClient
                .from('chatbot_knowledge')
                .select('*')
                .or(wordQueries.join(','))
                .limit(15);
                
              if (!keywordError && keywordMatches && keywordMatches.length > 0) {
                console.log(`Found ${keywordMatches.length} documents from keyword search`);
                
                if (foundRelevantContent) {
                  // Add only new documents
                  const existingIds = new Set(relevantContent.map(doc => doc.id));
                  const newDocs = keywordMatches.filter(doc => !existingIds.has(doc.id));
                  relevantContent = [...relevantContent, ...newDocs];
                } else {
                  relevantContent = keywordMatches;
                  foundRelevantContent = true;
                }
              } else {
                console.log("No results from combined keyword search");
              }
            } catch (error) {
              console.error("Error in keyword search:", error);
            }
          }
        }
        
        // 4. FOURTH SEARCH STRATEGY: Individual word search
        // Try each word individually as a last resort
        if (!foundRelevantContent || relevantContent.length < 2) {
          console.log("Trying individual word search as last resort...");
          
          const significantWords = cleanMessage.split(/\s+/)
            .filter(word => word.length > 3)
            .slice(0, 8); // Limit to avoid too many queries
            
          if (significantWords.length > 0) {
            const allResults = [];
            
            for (const word of significantWords) {
              const { data: wordMatches, error: wordError } = await supabaseClient
                .from('chatbot_knowledge')
                .select('*')
                .ilike('content', `%${word}%`)
                .limit(5);
                
              if (!wordError && wordMatches && wordMatches.length > 0) {
                allResults.push(...wordMatches);
              }
            }
            
            if (allResults.length > 0) {
              console.log(`Found ${allResults.length} documents from individual word search`);
              
              // Remove duplicates
              const uniqueIds = new Set();
              const uniqueResults = [];
              
              for (const doc of allResults) {
                if (!uniqueIds.has(doc.id)) {
                  uniqueIds.add(doc.id);
                  uniqueResults.push(doc);
                }
              }
              
              if (foundRelevantContent) {
                const existingIds = new Set(relevantContent.map(doc => doc.id));
                const newDocs = uniqueResults.filter(doc => !existingIds.has(doc.id));
                relevantContent = [...relevantContent, ...newDocs];
              } else {
                relevantContent = uniqueResults;
                foundRelevantContent = true;
              }
            }
          }
        }
        
        // 5. FINAL STRATEGY: Get the FAQ/common info document and some general docs
        // Always include the general information document
        try {
          const { data: generalInfo, error: generalError } = await supabaseClient
            .from('chatbot_knowledge')
            .select('*')
            .eq('page_id', '00000000-0000-0000-0000-000000000001')
            .limit(1);
            
          if (!generalError && generalInfo && generalInfo.length > 0) {
            console.log("Found general information document");
            
            // Add only if not already added
            const existingIds = new Set(relevantContent.map(doc => doc.id));
            if (!existingIds.has(generalInfo[0].id)) {
              relevantContent.push(generalInfo[0]);
            }
          }
        } catch (error) {
          console.error("Error fetching general info document:", error);
        }
        
        // If still empty, get the home page or any available document
        if (relevantContent.length === 0) {
          console.log("No relevant documents found, getting some default content");
          
          const { data: anyPages, error: anyError } = await supabaseClient
            .from('chatbot_knowledge')
            .select('*')
            .limit(5);
            
          if (!anyError && anyPages && anyPages.length > 0) {
            relevantContent = anyPages;
          }
        }
        
        console.log(`Final search results: ${relevantContent.length} documents`);
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
      .slice(-10) : [];  // Include more messages for better context

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
        if (lowerMessage.includes('wifi') && lowerTitle.includes('wifi')) score += 20;
        if (lowerMessage.includes('colazione') && lowerTitle.includes('colazione')) score += 20;
        if (lowerMessage.includes('ristorante') && lowerTitle.includes('ristorante')) score += 20;
        if (lowerMessage.includes('reception') && lowerTitle.includes('reception')) score += 20;
        if (lowerMessage.includes('camera') && lowerTitle.includes('camera')) score += 20;
        if (lowerMessage.includes('parcheggio') && lowerTitle.includes('parcheggio')) score += 20;
        if (lowerMessage.includes('orari') && (lowerTitle.includes('orari') || lowerTitle.includes('orario'))) score += 20;
        if (lowerMessage.includes('bici') && (lowerTitle.includes('bici') || lowerTitle.includes('biciclette'))) score += 20;
        if (lowerMessage.includes('deposito') && lowerTitle.includes('deposito')) score += 20;
        if (lowerMessage.includes('internet') && lowerTitle.includes('wifi')) score += 20;
        if (lowerMessage.includes('check') && (lowerTitle.includes('check') || lowerTitle.includes('reception'))) score += 20;
        
        // Similarity score if available (from vector search)
        if (doc.similarity) {
          score += doc.similarity * 50; // Scale up to make it significant
        }
        
        // Keywords in content
        const content = doc.content.toLowerCase();
        const messageWords = lowerMessage.split(/\s+/).filter(w => w.length > 3);
        
        for (const word of messageWords) {
          const matches = (content.match(new RegExp(word, 'g')) || []).length;
          score += matches * 3;  // 3 points per keyword match
        }

        // Special handling for "common questions" document
        if (doc.page_id === '00000000-0000-0000-0000-000000000001') {
          // Add a modest base score but not too high to allow more specific matches to rank higher
          score += 10;
        }
        
        return { ...doc, score };
      }).sort((a, b) => b.score - a.score);
      
      // Use scored and ordered documents
      knowledgeContext = "### INFORMAZIONI DALLA BASE DI CONOSCENZA DELLA LOCANDA DELL'ANGELO:\n\n" + 
        scoredDocuments.map(doc => {
          // Create a more structured format
          const truncatedContent = truncateContent(doc.content, 2000);
          return `DOCUMENTO [${doc.title}] (punteggio: ${doc.score.toFixed(1)}):\n${truncatedContent}\n`;
        }).join("\n\n---\n\n");
      
      // Final safety check - truncate the entire context if still too large
      knowledgeContext = truncateContent(knowledgeContext, 7000);
    } else {
      knowledgeContext = "ATTENZIONE: Non sono state trovate informazioni pertinenti nella base di conoscenza per rispondere alla domanda dell'utente.";
    }

    const promptWithContext = `${knowledgeContext}\n\nDOMANDA DELL'UTENTE: ${message}\n\nRispondi alla domanda dell'utente utilizzando ESCLUSIVAMENTE le informazioni fornite sopra dalla base di conoscenza. Ricorda di essere cordiale, preciso e di integrare sempre tutte le informazioni pertinenti disponibili negli estratti forniti. Se la domanda riguarda un servizio tipico ma non trovi informazioni specifiche, cerca nella sezione INFORMAZIONI STANDARD che potrebbe essere presente nei documenti.`;
    
    console.log("Number of relevant documents used for context:", relevantContent.length);
    
    // Call OpenAI for a response
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the smaller model for cost and speed
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...formattedHistory,
          { role: 'user', content: promptWithContext }
        ],
        temperature: 0.5, // Lower temperature for more factual responses
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
