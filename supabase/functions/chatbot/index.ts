
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Sei un assistente virtuale specializzato della Locanda dell'Angelo, una struttura ricettiva in Italia. 
Il tuo compito è fornire informazioni accurate e utili agli ospiti, rispondendo in modo naturale e cortese.

ISTRUZIONI IMPORTANTI:
1. Rispondi SEMPRE in italiano con uno stile cordiale, professionale e conversazionale.
2. Usa le informazioni presenti nella base di conoscenza per informare le tue risposte, ma NON citare direttamente il testo o menzionare "la base di conoscenza".
3. Formula risposte naturali e fluide, come se fossi un receptionist umano che conosce bene la struttura.
4. Se la domanda è ambigua, cerca di capire l'intento dell'utente basandoti sul contesto della conversazione.
5. Fornisci dettagli rilevanti e specifici quando possibile (orari, prezzi, posizioni, etc.), ma in modo conversazionale.
6. Personalizza le risposte facendo riferimento alla "Locanda dell'Angelo" per creare un'esperienza autentica.
7. Se non hai informazioni sufficienti per rispondere a una domanda specifica, sii onesto e suggerisci di contattare direttamente la reception.

IMPORTANTE: Non limitarti a ripetere il testo che trovi nella base di conoscenza. Usa quelle informazioni per creare una risposta originale, naturale e utile, come farebbe un receptionist umano competente e cordiale.`;

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
      wifi: ["wifi", "internet", "connessione", "password wifi", "rete", "connessione internet", "wi-fi", "wi fi"],
      colazione: ["colazione", "breakfast", "prima colazione", "orari colazione", "quando si fa colazione"],
      reception: ["reception", "accoglienza", "check-in", "check-out", "orari reception", "banco"],
      ristorante: ["ristorante", "restaurant", "cena", "pranzo", "mangiare", "orari ristorante", "orari pasti", "prenotare", "prenotazione"],
      camere: ["camera", "camere", "stanza", "stanze", "alloggio", "dormire", "servizi in camera"],
      minibar: ["minibar", "mini bar", "frigobar", "frigo", "bevande camera"],
      orari: ["orario", "orari", "tempo", "quando", "a che ora", "dalle", "alle"],
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
      // Preparare i documenti per il contesto
      knowledgeContext = "### INFORMAZIONI DISPONIBILI SULLA LOCANDA DELL'ANGELO:\n\n" + 
        relevantContent.map(doc => {
          return `DOCUMENTO: ${doc.title}\n${doc.content}\n`;
        }).join("\n---\n\n");
      
      // Troncare il contesto se troppo lungo
      knowledgeContext = truncateContent(knowledgeContext, 7000);
    } else {
      knowledgeContext = "ATTENZIONE: Non sono state trovate informazioni pertinenti nella base di conoscenza per rispondere alla domanda dell'utente.";
    }

    const promptWithContext = `${knowledgeContext}\n\nDOMANDA DELL'UTENTE: ${message}\n\nRispondi in modo naturale e conversazionale come un receptionist umano, utilizzando le informazioni sopra riportate per guidare la tua risposta. Ricorda di essere cordiale, preciso e di NON citare direttamente la fonte delle informazioni o menzionare "la base di conoscenza". Elabora le informazioni e fornisci una risposta originale, utile e personale.`;
    
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
        temperature: 0.7, // Aumentata leggermente per risposte più naturali e meno prevedibili
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
