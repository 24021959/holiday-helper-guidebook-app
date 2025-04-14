
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Sei un assistente virtuale per una struttura ricettiva. La tua funzione principale è fornire informazioni accurate e utili agli ospiti.

ISTRUZIONI IMPORTANTI:
1. Rispondi SEMPRE nella lingua dell'utente (principalmente italiano).
2. Basati ESCLUSIVAMENTE sulle informazioni fornite dalla base di conoscenza per rispondere.
3. Se trovi informazioni nella base di conoscenza, usale per dare risposte precise e complete.
4. Se NON trovi informazioni specifiche nella base di conoscenza, NON INVENTARE. Invece, rispondi cortesemente che non hai quell'informazione specifica e suggerisci di contattare la reception.
5. Devi dare SEMPRE precedenza alle informazioni trovate nella base di conoscenza rispetto a conoscenze generali.
6. Sii conciso ma completo. Formatta le tue risposte in modo chiaro e leggibile.
7. Se l'utente chiede informazioni su orari, servizi, o altre caratteristiche della struttura, cerca attentamente nella base di conoscenza.
8. Rispondi in modo cordiale e professionale, come faresti se fossi un receptionist della struttura.

Ricorda: il tuo scopo è assistere gli ospiti utilizzando le informazioni disponibili sulla struttura. La precisione è fondamentale.`;

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
        
        // Combine multiple search approaches for better results
        
        // 1. First try using embeddings if available
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
                  match_count: 6  // Increase number of matches
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
        
        // 2. If no results from vector search or very few results, add keyword search results
        if (relevantContent.length < 3) {
          const cleanedMessage = message.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
            .replace(/\s{2,}/g, " ")
            .trim();
            
          const searchTerms = cleanedMessage.split(/\s+/)
            .filter(term => term.length > 2)
            .slice(0, 8);  // Use more search terms
            
          console.log("Search terms:", searchTerms);
          
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
              .limit(8);  // Increase limit
              
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
        
        // 3. If still no results, get most recent documents as fallback
        if (relevantContent.length === 0) {
          const { data: recentDocs, error: recentError } = await supabaseClient
            .from('chatbot_knowledge')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (!recentError && recentDocs && recentDocs.length > 0) {
            console.log(`Using ${recentDocs.length} most recent documents as fallback`);
            relevantContent = recentDocs;
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
          response: "Mi dispiace, il servizio di assistenza non è disponibile al momento. Riprova più tardi o contatta direttamente la struttura." 
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
      .slice(-5) : [];  // Include last 5 messages for better context

    // Create context from knowledge base
    let knowledgeContext = "";
    if (knowledgeBaseEmpty) {
      knowledgeContext = "La base di conoscenza è vuota. Non ci sono informazioni specifiche sulla struttura.";
    } else if (relevantContent.length > 0) {
      knowledgeContext = "### Informazioni dalla base di conoscenza:\n\n" + 
        relevantContent.map(doc => {
          // Truncate each document's content to avoid token limits
          const truncatedContent = truncateContent(doc.content, 1500);
          return `Titolo: ${doc.title}\nURL: ${doc.path}\n${truncatedContent}`;
        }).join("\n\n---\n\n");
      
      // Final safety check - truncate the entire context if still too large
      knowledgeContext = truncateContent(knowledgeContext, 6000);
    } else {
      knowledgeContext = "Non ci sono informazioni specifiche nella base di conoscenza per questa richiesta.";
    }

    const promptWithContext = `${knowledgeContext}\n\nDomanda dell'utente: ${message}\n\nRispondi alla domanda dell'utente nella lingua "${language}" utilizzando le informazioni fornite sopra. Cerca di essere il più possibile preciso ed esaustivo utilizzando le informazioni disponibili.`;
    
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
        response: "Mi dispiace, si è verificato un errore durante l'elaborazione della tua richiesta. Riprova più tardi o contatta direttamente la struttura."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
