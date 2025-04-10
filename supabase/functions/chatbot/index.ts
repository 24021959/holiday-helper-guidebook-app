
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
    const { message, language, chatHistory = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Nessun messaggio fornito' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Ricevuto messaggio in ${language}: ${message}`);

    // Ottieni l'embedding per la domanda
    const questionEmbedding = await createEmbedding(message);
    
    if (!questionEmbedding) {
      throw new Error('Impossibile creare l\'embedding per la domanda');
    }

    // Ottieni contenuto rilevante dalla knowledge base
    const supabaseClient = createClient(
      supabaseUrl || '',
      supabaseKey || ''
    );

    // Ottieni le impostazioni del sito per la configurazione del chatbot
    const { data: settingsData, error: settingsError } = await supabaseClient
      .from('site_settings')
      .select('*')
      .eq('key', 'chatbot_config')
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error("Errore nel recupero delle impostazioni del chatbot:", settingsError);
    }

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

    // Cerca di recuperare informazioni rilevanti dalla knowledge base
    let contextText = "Nessuna informazione rilevante trovata.";
    let knowledgeFound = false;
    
    try {
      console.log("Esecuzione della ricerca vettoriale con embedding di lunghezza:", questionEmbedding.length);
      
      // Controlla se la tabella chatbot_knowledge esiste
      let hasKnowledgeTable = false;
      try {
        const { data: tableData, error: tableError } = await supabaseClient
          .rpc('table_exists', { table_name: 'chatbot_knowledge' });
          
        if (tableError) {
          console.error("Errore nel controllo dell'esistenza della tabella:", tableError);
        } else {
          hasKnowledgeTable = tableData;
          console.log("La tabella chatbot_knowledge esiste:", hasKnowledgeTable);
        }
      } catch (e) {
        console.error("Errore nel controllo dell'esistenza della tabella:", e);
      }
      
      // Se la tabella esiste, prova prima la ricerca vettoriale
      if (hasKnowledgeTable) {
        try {
          const { data: matchingContent, error: matchError } = await supabaseClient.rpc(
            'match_documents',
            {
              query_embedding: questionEmbedding,
              match_threshold: 0.5,
              match_count: 5
            }
          );

          if (matchError) {
            console.error("Errore nella ricerca vettoriale:", matchError);
            console.log("Provo con la query diretta...");
          } else if (matchingContent && matchingContent.length > 0) {
            // Miglioramento: ordina i risultati per rilevanza e formatta il contesto
            matchingContent.sort((a, b) => b.similarity - a.similarity);
            
            contextText = matchingContent.map((item, index) => 
              `[${index + 1}] ${item.title}\n${item.content}`
            ).join("\n\n");
            
            knowledgeFound = true;
            console.log(`Trovati ${matchingContent.length} documenti corrispondenti tramite ricerca vettoriale`);
          } else {
            console.log("Nessun contenuto corrispondente trovato tramite ricerca vettoriale");
          }
        } catch (vectorError) {
          console.error("Errore nella ricerca vettoriale:", vectorError);
        }
        
        // Se non sono stati trovati risultati con la ricerca vettoriale, prova con una query diretta
        if (!knowledgeFound) {
          try {
            const { data: directQueryData, error: directQueryError } = await supabaseClient
              .from('chatbot_knowledge')
              .select('title, content')
              .limit(5);
              
            if (directQueryError) {
              console.error("Errore nella query diretta:", directQueryError);
            } else if (directQueryData && directQueryData.length > 0) {
              console.log(`Trovati ${directQueryData.length} elementi della knowledge base tramite query diretta`);
              contextText = directQueryData.map((item, index) => 
                `[${index + 1}] ${item.title}\n${item.content}`
              ).join("\n\n");
              knowledgeFound = true;
            }
          } catch (directQueryError) {
            console.error("Errore nella query diretta:", directQueryError);
          }
        }
      } else {
        console.log("La tabella della knowledge base non esiste ancora");
        
        // Fallback: prova a ottenere dati dalle pagine direttamente
        try {
          const { data: pagesData, error: pagesError } = await supabaseClient
            .from('custom_pages')
            .select('title, content')
            .eq('published', true)
            .limit(3);
            
          if (pagesError) {
            console.error("Errore nel recupero delle pagine:", pagesError);
          } else if (pagesData && pagesData.length > 0) {
            console.log(`Utilizzando ${pagesData.length} pagine come fallback per il contesto`);
            contextText = pagesData.map((item, index) => 
              `[${index + 1}] ${item.title}\n${(item.content || "").replace(/<[^>]*>/g, " ").trim()}`
            ).join("\n\n");
            knowledgeFound = true;
          }
        } catch (pagesError) {
          console.error("Errore nel recupero delle pagine:", pagesError);
        }
      }
    } catch (e) {
      console.error("Errore nella ricerca della knowledge base:", e);
      console.log("Procedo senza corrispondenze dalla knowledge base.");
    }

    // Aggiungi informazioni sullo stato della knowledge base per il debug
    if (!knowledgeFound) {
      contextText += "\n\nNota: La knowledge base potrebbe non essere ancora configurata correttamente o potrebbe non contenere informazioni rilevanti per questa domanda.";
    }

    // Costruisci il messaggio di sistema in base alla lingua
    let systemPrompt = "";
    
    switch (language) {
      case 'it':
        systemPrompt = `Sei ${chatbotConfig.botName}, un assistente AI che aiuta i visitatori di un sito web. 
          Rispondi a domande basate sui contenuti del sito. Rispondi SEMPRE in italiano.
          Se non conosci la risposta, sii onesto e suggerisci di contattare direttamente la struttura.
          Non inventare informazioni non presenti nel contesto fornito.
          Sii conciso ma completo nelle tue risposte.`;
        break;
      case 'en':
        systemPrompt = `You are ${chatbotConfig.botName}, an AI assistant helping website visitors.
          Answer questions based on the website content. ALWAYS answer in English.
          If you don't know the answer, be honest and suggest contacting the establishment directly.
          Don't make up information not present in the provided context.
          Be concise but thorough in your responses.`;
        break;
      case 'fr':
        systemPrompt = `Vous êtes ${chatbotConfig.botName}, un assistant IA qui aide les visiteurs du site web.
          Répondez aux questions basées sur le contenu du site. Répondez TOUJOURS en français.
          Si vous ne connaissez pas la réponse, soyez honnête et suggérez de contacter directement l'établissement.
          N'inventez pas d'informations qui ne sont pas présentes dans le contexte fourni.
          Soyez concis mais complet dans vos réponses.`;
        break;
      case 'es':
        systemPrompt = `Eres ${chatbotConfig.botName}, un asistente de IA que ayuda a los visitantes del sitio web.
          Responde preguntas basadas en el contenido del sitio. Responde SIEMPRE en español.
          Si no conoces la respuesta, sé honesto y sugiere contactar directamente con el establecimiento.
          No inventes información que no esté presente en el contexto proporcionado.
          Sé conciso pero completo en tus respuestas.`;
        break;
      case 'de':
        systemPrompt = `Sie sind ${chatbotConfig.botName}, ein KI-Assistent, der Webseitenbesuchern hilft.
          Beantworten Sie Fragen basierend auf dem Inhalt der Website. Antworten Sie IMMER auf Deutsch.
          Wenn Sie die Antwort nicht kennen, seien Sie ehrlich und schlagen Sie vor, das Unternehmen direkt zu kontaktieren.
          Erfinden Sie keine Informationen, die nicht im bereitgestellten Kontext enthalten sind.
          Seien Sie präzise aber umfassend in Ihren Antworten.`;
        break;
      default:
        systemPrompt = `You are ${chatbotConfig.botName}, an AI assistant helping website visitors.
          Answer questions based on the website content. Identify the language of the question and respond in the same language.
          If you don't know the answer, be honest and suggest contacting the establishment directly.
          Don't make up information not present in the provided context.
          Be concise but thorough in your responses.`;
    }

    // Prepara la cronologia della conversazione per la chiamata API
    const conversationHistory = [
      { role: "system", content: systemPrompt },
      { role: "system", content: `Ecco informazioni rilevanti dal sito web: ${contextText}` }
    ];

    // Aggiungi la cronologia della chat
    chatHistory.forEach((entry: any) => {
      conversationHistory.push({ 
        role: entry.role, 
        content: entry.content 
      });
    });

    // Aggiungi il messaggio corrente
    conversationHistory.push({ role: "user", content: message });

    // Registra la conversazione per il debug
    console.log("Cronologia della conversazione:", JSON.stringify(conversationHistory));

    // Chiama l'API OpenAI
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
    
    if (!response.ok) {
      console.error('Errore API OpenAI:', data);
      throw new Error(`Errore API OpenAI: ${data.error?.message || 'Errore sconosciuto'}`);
    }
    
    const botResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: botResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Errore nella funzione chatbot:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Funzione helper per creare embedding usando OpenAI
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
        input: text.slice(0, 8000) // Limita a 8000 caratteri
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Errore API OpenAI embedding:', data);
      throw new Error(`Errore API OpenAI embedding: ${data.error?.message || 'Errore sconosciuto'}`);
    }
    
    return data.data[0].embedding;
  } catch (error) {
    console.error('Errore nella creazione dell\'embedding:', error);
    return null;
  }
}
