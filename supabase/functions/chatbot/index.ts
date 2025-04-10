
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language, chatHistory = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'No message provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Received message in ${language}: ${message}`);

    // Get the embedding for the question
    const questionEmbedding = await createEmbedding(message);
    
    if (!questionEmbedding) {
      throw new Error('Failed to create embedding for question');
    }

    // Get relevant content from the knowledge base
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get site settings for chatbot config
    const { data: settingsData } = await supabaseClient
      .from('site_settings')
      .select('*')
      .eq('key', 'chatbot_config')
      .single();

    const chatbotConfig = settingsData?.value || {
      botName: "Assistente Virtuale",
      welcomeMessage: {
        it: "Ciao! Sono qui per aiutarti. Come posso assisterti oggi?",
        en: "Hi! I'm here to help. How can I assist you today?",
        fr: "Bonjour! Je suis là pour vous aider. Comment puis-je vous aider aujourd'hui?",
        es: "¡Hola! Estoy aquí para ayudarte. ¿Cómo puedo ayudarte hoy?",
        de: "Hallo! Ich bin hier um zu helfen. Wie kann ich Ihnen heute helfen?"
      }
    };

    // Perform vector search
    const { data: matchingContent } = await supabaseClient.rpc(
      'match_documents',
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.5,
        match_count: 5
      }
    );

    let contextText = "No relevant information found.";
    
    if (matchingContent && matchingContent.length > 0) {
      contextText = matchingContent.map((item: any) => item.content).join("\n\n");
    }

    // Build system message based on the language
    let systemPrompt = "";
    
    switch (language) {
      case 'it':
        systemPrompt = `Sei ${chatbotConfig.botName}, un assistente AI che aiuta i visitatori di un sito web. 
          Rispondi a domande basate sui contenuti del sito. Rispondi SEMPRE in italiano.
          Se non conosci la risposta, sii onesto e suggerisci di contattare direttamente la struttura.
          Non inventare informazioni non presenti nel contesto fornito.`;
        break;
      case 'en':
        systemPrompt = `You are ${chatbotConfig.botName}, an AI assistant helping website visitors.
          Answer questions based on the website content. ALWAYS answer in English.
          If you don't know the answer, be honest and suggest contacting the establishment directly.
          Don't make up information not present in the provided context.`;
        break;
      case 'fr':
        systemPrompt = `Vous êtes ${chatbotConfig.botName}, un assistant IA qui aide les visiteurs du site web.
          Répondez aux questions basées sur le contenu du site. Répondez TOUJOURS en français.
          Si vous ne connaissez pas la réponse, soyez honnête et suggérez de contacter directement l'établissement.
          N'inventez pas d'informations qui ne sont pas présentes dans le contexte fourni.`;
        break;
      case 'es':
        systemPrompt = `Eres ${chatbotConfig.botName}, un asistente de IA que ayuda a los visitantes del sitio web.
          Responde preguntas basadas en el contenido del sitio. Responde SIEMPRE en español.
          Si no conoces la respuesta, sé honesto y sugiere contactar directamente con el establecimiento.
          No inventes información que no esté presente en el contexto proporcionado.`;
        break;
      case 'de':
        systemPrompt = `Sie sind ${chatbotConfig.botName}, ein KI-Assistent, der Webseitenbesuchern hilft.
          Beantworten Sie Fragen basierend auf dem Inhalt der Website. Antworten Sie IMMER auf Deutsch.
          Wenn Sie die Antwort nicht kennen, seien Sie ehrlich und schlagen Sie vor, das Unternehmen direkt zu kontaktieren.
          Erfinden Sie keine Informationen, die nicht im bereitgestellten Kontext enthalten sind.`;
        break;
      default:
        systemPrompt = `You are ${chatbotConfig.botName}, an AI assistant helping website visitors.
          Answer questions based on the website content. Identify the language of the question and respond in the same language.
          If you don't know the answer, be honest and suggest contacting the establishment directly.
          Don't make up information not present in the provided context.`;
    }

    // Prepare conversation history for the API call
    const conversationHistory = [
      { role: "system", content: systemPrompt },
      { role: "system", content: `Here is relevant information from the website: ${contextText}` }
    ];

    // Add chat history
    chatHistory.forEach((entry: any) => {
      conversationHistory.push({ 
        role: entry.role, 
        content: entry.content 
      });
    });

    // Add current message
    conversationHistory.push({ role: "user", content: message });

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const botResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: botResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chatbot function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to create embeddings using OpenAI
async function createEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text
      }),
    });

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    return null;
  }
}

// Helper function to create Supabase client
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    from: (table: string) => ({
      select: (columns = '*') => ({
        eq(column: string, value: any) {
          return this;
        },
        single() {
          return this;
        },
        async then() {
          // This is a simplified version
          return { data: null };
        }
      }),
    }),
    rpc: (functionName: string, params: any) => ({
      async then() {
        // Implementation for vector search would go here
        return { data: [] };
      }
    }),
  };
}
