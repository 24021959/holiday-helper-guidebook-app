
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

    // Initialize Supabase client
    const supabaseClient = createClient(
      supabaseUrl || '',
      supabaseKey || ''
    );

    // Get relevant documents from the knowledge base
    let relevantContent = [];
    try {
      // Check if chatbot_knowledge table exists
      try {
        const { data: tableExists, error: tableCheckError } = await supabaseClient
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'chatbot_knowledge')
          .single();
          
        if (tableCheckError || !tableExists) {
          throw new Error('Knowledge base table does not exist');
        }
      } catch (tableError) {
        console.error("Error checking if table exists:", tableError);
        // Continue with empty relevant content
      }
      
      // Query the knowledge base
      const { data: knowledgeData, error: knowledgeError } = await supabaseClient
        .from('chatbot_knowledge')
        .select('*')
        .limit(10);
      
      if (knowledgeError) {
        throw knowledgeError;
      }
      
      if (knowledgeData && knowledgeData.length > 0) {
        // Simple text search to find most relevant documents
        const normalizedQuery = message.toLowerCase();
        relevantContent = knowledgeData
          .map(item => ({
            ...item,
            relevance: calculateRelevance(item.content, normalizedQuery)
          }))
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, 3); // Get top 3 most relevant documents
      }
    } catch (error) {
      console.error("Error retrieving knowledge base content:", error);
      // Continue with empty relevant content
    }

    if (!openAIApiKey) {
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
    })) : [];

    // Create context from knowledge base
    let knowledgeContext = "";
    if (relevantContent.length > 0) {
      knowledgeContext = "### Informazioni dalla base di conoscenza:\n\n" + 
        relevantContent.map(doc => doc.content).join("\n\n---\n\n");
    } else {
      knowledgeContext = "Non ci sono informazioni specifiche nella base di conoscenza per questa richiesta.";
    }

    const promptWithContext = `${knowledgeContext}\n\nDomanda dell'utente: ${message}\n\nRispondi alla domanda dell'utente nella lingua "${language}" utilizzando le informazioni fornite sopra.`;

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
          ...formattedHistory.slice(-4), // Include last 4 messages for context
          { role: 'user', content: promptWithContext }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      
      return new Response(
        JSON.stringify({ 
          response: `Mi dispiace, ho avuto un problema nel generare una risposta. Riprova più tardi o contatta direttamente la struttura.` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

// Simple relevance calculation function (keyword matching)
function calculateRelevance(content: string, query: string): number {
  if (!content) return 0;
  
  const normalizedContent = content.toLowerCase();
  const queryWords = query.split(/\s+/).filter(word => word.length > 2);
  
  let score = 0;
  for (const word of queryWords) {
    const regex = new RegExp(word, 'gi');
    const matches = normalizedContent.match(regex) || [];
    score += matches.length;
  }
  
  // Bonus points for title matches
  if (normalizedContent.includes("title:")) {
    for (const word of queryWords) {
      const titleMatch = normalizedContent.match(new RegExp(`title:.*${word}`, 'i'));
      if (titleMatch) {
        score += 5;
      }
    }
  }
  
  return score;
}
