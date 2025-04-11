
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

    // Ensure the chatbot_knowledge table exists
    try {
      await supabaseClient.rpc("run_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            page_id uuid NOT NULL,
            title text NOT NULL,
            content text NOT NULL,
            path text NOT NULL,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
          )
        `
      });
    } catch (error) {
      console.error("Error ensuring table exists (continuing anyway):", error);
      // Continue execution - the table might already exist
    }

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
      
      // Extract meaningful keywords from the user's message
      const searchTerms = message.toLowerCase().split(/\s+/)
        .filter((term: string) => term.length > 3)  // Only terms with 4+ chars
        .slice(0, 6);  // Limit to 6 keywords
        
      console.log("Search terms:", searchTerms);
      
      if (searchTerms.length === 0) {
        // If no good search terms, get most recently updated documents
        console.log("No good search terms found, retrieving recent documents");
        const { data: recentDocs, error: recentError } = await supabaseClient
          .from('chatbot_knowledge')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(3);
          
        if (recentError) {
          console.error("Error fetching recent documents:", recentError);
        } else if (recentDocs && recentDocs.length > 0) {
          relevantContent = recentDocs;
          console.log(`Selected ${relevantContent.length} recent documents`);
        }
      } else {
        // Build a search query for each keyword with full text search
        let queries = [];
        
        for (const term of searchTerms) {
          if (term.length >= 3) {
            // Search in both title and content with weights
            const query = supabaseClient
              .from('chatbot_knowledge')
              .select('*')
              .or(`title.ilike.%${term}%,content.ilike.%${term}%`)
              .limit(10);
              
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
        
        // Sort by relevance score and take the top 3
        relevantContent = scoredDocs
          .sort((a, b) => b.relevance_score - a.relevance_score)
          .slice(0, 3);
          
        console.log(`Selected ${relevantContent.length} most relevant documents`);
      }
      
      // If we still have no content, get all documents as last resort
      if (relevantContent.length === 0) {
        console.log("No relevant content found, retrieving all documents");
        const { data: allDocs, error: allError } = await supabaseClient
          .from('chatbot_knowledge')
          .select('*')
          .limit(3);
          
        if (allError) {
          console.error("Error fetching all documents:", allError);
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

    // Format the chat history for the OpenAI API
    const formattedHistory = chatHistory ? chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })).slice(-4) : [];  // Only include last 4 messages for context

    // Create context from knowledge base
    let knowledgeContext = "";
    if (relevantContent.length > 0) {
      knowledgeContext = "### Informazioni dalla base di conoscenza:\n\n" + 
        relevantContent.map(doc => doc.content).join("\n\n---\n\n");
      console.log("Knowledge context created from relevant documents");
    } else {
      knowledgeContext = "Non ci sono informazioni specifiche nella base di conoscenza per questa richiesta.";
      console.log("No relevant documents found");
    }

    const promptWithContext = `${knowledgeContext}\n\nDomanda dell'utente: ${message}\n\nRispondi alla domanda dell'utente nella lingua "${language}" utilizzando le informazioni fornite sopra.`;

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
