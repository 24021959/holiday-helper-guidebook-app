
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Sei un assistente virtuale per una struttura ricettiva. Usa le informazioni fornite dalla base di conoscenza per rispondere alle domande degli utenti in modo preciso e cordiale. Rispondi sempre nella lingua dell'utente.

Se non trovi informazioni sufficienti nella base di conoscenza, rispondi in modo educato dicendo che non hai abbastanza informazioni, e suggerisci di contattare direttamente la struttura. Non inventare mai informazioni che non sono presenti nella base di conoscenza.

Sii conciso ma completo. Formatta le tue risposte in modo chiaro e leggibile, usando elenchi puntati o numerati quando appropriato.`;

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Approx token count estimator
function estimateTokenCount(text) {
  // Rough estimation: ~4 characters per token for languages like English
  // For languages with non-Latin characters, this might be different
  return Math.ceil(text.length / 4);
}

// Function to truncate content if it's too long
function truncateContent(content, maxTokens = 8000) {
  if (estimateTokenCount(content) <= maxTokens) {
    return content;
  }
  
  // If content is too long, truncate it to approximate token limit
  // We'll keep first part as it often contains most relevant info
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

    // Get relevant documents from the knowledge base using better semantic search
    let relevantContent = [];
    try {
      // Check if the table exists and has records
      const { count, error: countError } = await supabaseClient
        .from('chatbot_knowledge')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error("Error checking knowledge base:", countError);
        throw new Error("Knowledge base unavailable");
      }
      
      if (!count || count === 0) {
        console.log("Knowledge base is empty");
        throw new Error("Knowledge base is empty");
      }
      
      console.log(`Found ${count} documents in knowledge base`);
      
      // Improved search algorithm - use multiple approaches
      
      // 1. Extract meaningful keywords from the user's message
      const cleanedMessage = message.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
        
      const searchTerms = cleanedMessage.split(/\s+/)
        .filter((term) => term.length > 3)  // Only terms with 4+ chars
        .slice(0, 8);  // Increased from 6 to 8 keywords
        
      console.log("Search terms:", searchTerms);
      
      // If no good search terms, try to get most relevant documents
      if (searchTerms.length === 0) {
        // Try to get most recently updated documents
        console.log("No good search terms found, retrieving recent documents");
        const { data: recentDocs, error: recentError } = await supabaseClient
          .from('chatbot_knowledge')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(3); // Increased from 2 to 3
          
        if (recentError) {
          console.error("Error fetching recent documents:", recentError);
        } else if (recentDocs && recentDocs.length > 0) {
          relevantContent = recentDocs;
          console.log(`Selected ${relevantContent.length} recent documents`);
        }
      } else {
        // 2. Try full-text search first for exact matches
        const exactMatches = [];
        
        // Try an exact phrase match first
        if (cleanedMessage.length >= 5) {
          const { data: exactResults, error: exactError } = await supabaseClient
            .from('chatbot_knowledge')
            .select('*')
            .textSearch('content', `'${cleanedMessage}'`, { 
              type: 'plain',
              config: 'italian' 
            })
            .limit(2);
            
          if (!exactError && exactResults && exactResults.length > 0) {
            console.log(`Found ${exactResults.length} exact phrase matches`);
            exactMatches.push(...exactResults);
          }
        }
        
        // 3. Then try keyword search as fallback
        const keywordMatches = [];
        let queries = [];
        
        for (const term of searchTerms) {
          if (term.length >= 3) {
            // Search in both title and content with weights
            const query = supabaseClient
              .from('chatbot_knowledge')
              .select('*')
              .or(`title.ilike.%${term}%,content.ilike.%${term}%`)
              .limit(3);
              
            queries.push(query);
          }
        }
        
        // Execute all queries in parallel
        const results = await Promise.all(queries.map(q => q));
        
        // Collect all unique documents
        const allDocs = [];
        const seenIds = new Set();
        
        for (const result of results) {
          if (result.data) {
            for (const doc of result.data) {
              if (!seenIds.has(doc.id)) {
                seenIds.add(doc.id);
                allDocs.push(doc);
              }
            }
          }
        }
        
        // Score documents by keyword matches
        const scoredDocs = allDocs.map(doc => {
          const docText = (doc.title + ' ' + doc.content).toLowerCase();
          const score = searchTerms.reduce((count, term) => {
            return count + (docText.includes(term) ? 1 : 0);
          }, 0);
          return { ...doc, relevance_score: score };
        });
        
        // Sort by relevance score and take the top results
        keywordMatches.push(...scoredDocs
          .sort((a, b) => b.relevance_score - a.relevance_score)
          .slice(0, 3));
          
        console.log(`Found ${keywordMatches.length} keyword matches`);
        
        // 4. Combine both search approaches, prioritizing exact matches
        const combinedResults = [...exactMatches];
        
        // Add keyword matches that aren't already in the exact matches
        const exactIds = new Set(exactMatches.map(doc => doc.id));
        for (const doc of keywordMatches) {
          if (!exactIds.has(doc.id)) {
            combinedResults.push(doc);
          }
        }
        
        // Limit to top 3 most relevant documents
        relevantContent = combinedResults.slice(0, 3);
        
        console.log(`Selected ${relevantContent.length} most relevant documents in total`);
      }
      
      // If we still have no content, get some documents as last resort
      if (relevantContent.length === 0) {
        console.log("No relevant content found, retrieving a sample of documents");
        const { data: allDocs, error: allError } = await supabaseClient
          .from('chatbot_knowledge')
          .select('*')
          .limit(3);
          
        if (allError) {
          console.error("Error fetching documents:", allError);
        } else if (allDocs) {
          relevantContent = allDocs;
          console.log(`Retrieved ${relevantContent.length} documents as fallback`);
        }
      }
    } catch (error) {
      console.error("Error retrieving knowledge base content:", error);
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

    // Format the chat history for the OpenAI API - limit to only last 2 messages to save tokens
    const formattedHistory = chatHistory ? chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })).slice(-2) : [];  // Only include last 2 messages for context

    // Create context from knowledge base - TRUNCATE content to avoid token limits
    let knowledgeContext = "";
    if (relevantContent.length > 0) {
      knowledgeContext = "### Informazioni dalla base di conoscenza:\n\n" + 
        relevantContent.map(doc => {
          // Truncate each document's content to avoid token limits
          return `Titolo: ${doc.title}\nURL: ${doc.path}\n${truncateContent(doc.content, 3000)}`;
        }).join("\n\n---\n\n");
      
      // Final safety check - truncate the entire context if still too large
      knowledgeContext = truncateContent(knowledgeContext, 7000);
      console.log("Knowledge context created (estimated tokens: " + estimateTokenCount(knowledgeContext) + ")");
    } else {
      knowledgeContext = "Non ci sono informazioni specifiche nella base di conoscenza per questa richiesta.";
      console.log("No relevant documents found");
    }

    const promptWithContext = `${knowledgeContext}\n\nDomanda dell'utente: ${message}\n\nRispondi alla domanda dell'utente nella lingua "${language}" utilizzando le informazioni fornite sopra.`;
    
    // Estimate total token usage
    const estimatedSystemTokens = estimateTokenCount(SYSTEM_PROMPT);
    const estimatedHistoryTokens = formattedHistory.reduce((acc, msg) => acc + estimateTokenCount(msg.content), 0);
    const estimatedPromptTokens = estimateTokenCount(promptWithContext);
    const totalEstimatedTokens = estimatedSystemTokens + estimatedHistoryTokens + estimatedPromptTokens;
    
    console.log(`Estimated tokens: System=${estimatedSystemTokens}, History=${estimatedHistoryTokens}, Prompt=${estimatedPromptTokens}, Total=${totalEstimatedTokens}`);
    console.log("Calling OpenAI API...");
    
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
          // Set a reasonable max_tokens to prevent exceeding limits
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
