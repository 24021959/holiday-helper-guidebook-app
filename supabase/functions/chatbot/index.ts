
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Sei un assistente virtuale per una struttura ricettiva chiamata "Locanda dell'Angelo". Usa le informazioni fornite dalla base di conoscenza per rispondere alle domande degli utenti in modo preciso e cordiale. Rispondi sempre nella lingua dell'utente.

Se non trovi informazioni sufficienti nella base di conoscenza, rispondi in modo educato dicendo che non hai abbastanza informazioni, e suggerisci di contattare direttamente la struttura. Non inventare mai informazioni che non sono presenti nella base di conoscenza.

Sii conciso ma completo. Formatta le tue risposte in modo chiaro e leggibile, usando elenchi puntati o numerati quando appropriato.`;

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
    console.log("Chatbot function called");
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
    
    console.log("Supabase client initialized");

    // Get relevant documents from the knowledge base
    let relevantContent = [];
    let knowledgeBaseEmpty = false;
    
    try {
      // Check if the table exists and has records
      console.log("Checking if knowledge base exists and has content");
      
      // First verify the table exists
      const { data: tableExists, error: tableExistsError } = await supabaseClient.rpc(
        'table_exists',
        { table_name: 'chatbot_knowledge' }
      ).maybeSingle();
      
      if (tableExistsError) {
        console.error("Error checking if table exists:", tableExistsError);
        // Continue with a different approach
      } else if (!tableExists) {
        console.log("Table doesn't exist, setting knowledgeBaseEmpty to true");
        knowledgeBaseEmpty = true;
      } else {
        // Now check if there are records
        const { count, error: countError } = await supabaseClient
          .from('chatbot_knowledge')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error("Error checking knowledge base count:", countError);
          // Try a different approach
          const { data: records, error: recordsError } = await supabaseClient
            .from('chatbot_knowledge')
            .select('id')
            .limit(1);
            
          if (recordsError || !records || records.length === 0) {
            console.log("Knowledge base appears to be empty");
            knowledgeBaseEmpty = true;
          } else {
            console.log(`Found at least ${records.length} document in knowledge base`);
          }
        } else {
          console.log(`Knowledge base count: ${count}`);
          
          if (!count || count === 0) {
            console.log("Knowledge base is empty");
            knowledgeBaseEmpty = true;
          } else {
            console.log(`Found ${count} documents in knowledge base`);
            
            // Extract search terms from message
            const cleanedMessage = message.toLowerCase()
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
              .replace(/\s{2,}/g, " ")
              .trim();
              
            const searchTerms = cleanedMessage.split(/\s+/)
              .filter((term) => term.length > 2)
              .slice(0, 10);
              
            console.log("Search terms:", searchTerms);

            // Perform multiple search approaches in sequence
            
            // 1. Try exact phrase search first
            try {
              const { data: exactMatches, error: exactError } = await supabaseClient
                .from('chatbot_knowledge')
                .select('*')
                .textSearch('content', `'${cleanedMessage}'`, { 
                  type: 'plain',
                  config: 'italian' 
                })
                .limit(3);
                
              if (exactError) {
                console.error("Error in exact search:", exactError);
              } else if (exactMatches && exactMatches.length > 0) {
                console.log(`Found ${exactMatches.length} exact phrase matches`);
                relevantContent = [...exactMatches];
              } else {
                console.log("No exact matches found, trying similarity search");
              }
            } catch (exactSearchError) {
              console.error("Error in exact phrase search:", exactSearchError);
            }
            
            // 2. If no exact matches, try keyword search
            if (relevantContent.length === 0 && searchTerms.length > 0) {
              try {
                // Build an OR condition for each search term
                let orConditions = [];
                
                for (const term of searchTerms) {
                  if (term.length >= 3) {
                    orConditions.push(`title.ilike.%${term}%`);
                    orConditions.push(`content.ilike.%${term}%`);
                  }
                }
                
                if (orConditions.length > 0) {
                  console.log("Trying keyword search with OR conditions");
                  const orQuery = orConditions.join(',');
                  
                  const { data: keywordMatches, error: keywordError } = await supabaseClient
                    .from('chatbot_knowledge')
                    .select('*')
                    .or(orQuery)
                    .limit(5);
                    
                  if (keywordError) {
                    console.error("Error in keyword search:", keywordError);
                  } else if (keywordMatches && keywordMatches.length > 0) {
                    console.log(`Found ${keywordMatches.length} keyword matches`);
                    
                    // Score results by number of matching terms
                    const scoredResults = keywordMatches.map(doc => {
                      const docText = (doc.title + ' ' + doc.content).toLowerCase();
                      const score = searchTerms.filter(term => docText.includes(term)).length;
                      return { ...doc, score };
                    });
                    
                    // Sort by score and take top results
                    const topResults = scoredResults
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 5);
                      
                    console.log(`Selected top ${topResults.length} results by relevance score`);
                    relevantContent = [...topResults];
                  }
                }
              } catch (keywordSearchError) {
                console.error("Error in keyword search:", keywordSearchError);
              }
            }
            
            // 3. Try direct content search for individual terms if still no results
            if (relevantContent.length === 0 && searchTerms.length > 0) {
              try {
                console.log("Trying direct content search for individual terms");
                let allResults = [];
                
                for (const term of searchTerms) {
                  if (term.length >= 3) {
                    const { data: results, error: termError } = await supabaseClient
                      .from('chatbot_knowledge')
                      .select('*')
                      .ilike('content', `%${term}%`)
                      .limit(3);
                      
                    if (!termError && results && results.length > 0) {
                      console.log(`Found ${results.length} matches for term "${term}"`);
                      allResults.push(...results);
                    }
                  }
                }
                
                // Deduplicate results
                if (allResults.length > 0) {
                  const seen = new Set();
                  const uniqueResults = allResults.filter(item => {
                    const duplicate = seen.has(item.id);
                    seen.add(item.id);
                    return !duplicate;
                  });
                  
                  console.log(`Found ${uniqueResults.length} unique term matches`);
                  relevantContent = [...uniqueResults.slice(0, 5)];
                }
              } catch (directSearchError) {
                console.error("Error in direct content search:", directSearchError);
              }
            }
            
            // 4. If we still don't have relevant content, get the most recent documents
            if (relevantContent.length === 0) {
              console.log("No relevant content found, fetching recent documents");
              try {
                const { data: recentDocs, error: recentError } = await supabaseClient
                  .from('chatbot_knowledge')
                  .select('*')
                  .order('updated_at', { ascending: false })
                  .limit(5);
                  
                if (recentError) {
                  console.error("Error fetching recent documents:", recentError);
                } else if (recentDocs && recentDocs.length > 0) {
                  console.log(`Retrieved ${recentDocs.length} recent documents`);
                  relevantContent = recentDocs;
                }
              } catch (recentDocsError) {
                console.error("Error fetching recent documents:", recentDocsError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error accessing knowledge base:", error);
      // Continue with empty relevant content
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

    // Format the chat history for the OpenAI API (limit to last few messages to save tokens)
    const formattedHistory = chatHistory ? chatHistory
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      .slice(-4) : [];  // Include last 4 messages for better context

    // Create context from knowledge base
    let knowledgeContext = "";
    if (knowledgeBaseEmpty) {
      knowledgeContext = "La base di conoscenza è vuota. Non ci sono informazioni specifiche sulla struttura.";
      console.log("Knowledge base is empty, using empty context");
    } else if (relevantContent.length > 0) {
      knowledgeContext = "### Informazioni dalla base di conoscenza:\n\n" + 
        relevantContent.map(doc => {
          // Truncate each document's content to avoid token limits
          const truncatedContent = truncateContent(doc.content, 2000);
          return `Titolo: ${doc.title}\nURL: ${doc.path}\n${truncatedContent}`;
        }).join("\n\n---\n\n");
      
      // Final safety check - truncate the entire context if still too large
      knowledgeContext = truncateContent(knowledgeContext, 7000);
      console.log("Knowledge context created, estimated tokens:", estimateTokenCount(knowledgeContext));
    } else {
      knowledgeContext = "Non ci sono informazioni specifiche nella base di conoscenza per questa richiesta.";
      console.log("No relevant documents found, using empty context");
    }

    console.log("Creating prompt with context");
    const promptWithContext = `${knowledgeContext}\n\nDomanda dell'utente: ${message}\n\nRispondi alla domanda dell'utente nella lingua "${language}" utilizzando le informazioni fornite sopra.`;
    
    console.log("Calling OpenAI API with prompt and context");
    
    // Call OpenAI for a response with better error handling
    try {
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
        console.error("OpenAI API error:", errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Invalid response format from OpenAI:", data);
        throw new Error("Invalid response format from OpenAI");
      }
      
      const chatbotResponse = data.choices[0].message.content;
      console.log("Received response from OpenAI");

      return new Response(
        JSON.stringify({ response: chatbotResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (openAIError) {
      console.error('OpenAI API error:', openAIError);
      
      return new Response(
        JSON.stringify({ 
          error: openAIError.message,
          response: "Mi dispiace, si è verificato un errore durante l'elaborazione della tua richiesta. Riprova più tardi o contatta direttamente la struttura."
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
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
