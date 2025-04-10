
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
        JSON.stringify({ error: 'No message provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Ricevuto messaggio in ${language}: ${message}`);

    // Get the embedding for the question
    const questionEmbedding = await createEmbedding(message);
    
    if (!questionEmbedding) {
      throw new Error('Impossibile creare embedding per la domanda');
    }

    // Get relevant content from the knowledge base
    const supabaseClient = createClient(
      supabaseUrl || '',
      supabaseKey || ''
    );

    // Get site settings for chatbot config
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

    // Try to fetch relevant information from the knowledge base
    let contextText = "Nessuna informazione rilevante trovata.";
    let knowledgeFound = false;
    
    try {
      console.log("Esecuzione ricerca vettoriale con embedding di lunghezza:", questionEmbedding.length);
      
      // Check if the vector extension exists
      let hasVectorExtension = false;
      try {
        const { data: extensionData, error: extensionError } = await supabaseClient
          .rpc('run_sql', {
            sql: "SELECT 1 FROM pg_extension WHERE extname = 'vector'"
          });
          
        if (extensionError) {
          console.error("Errore nel controllo dell'estensione vector:", extensionError);
        } else {
          hasVectorExtension = extensionData && extensionData.length > 0;
          console.log("Estensione vettoriale esiste:", hasVectorExtension);
        }
      } catch (e) {
        console.error("Errore nel controllo dell'estensione vector:", e);
      }

      // Check if the chatbot_knowledge table exists
      let hasKnowledgeTable = false;
      try {
        const { data: tableData, error: tableError } = await supabaseClient
          .rpc('run_sql', {
            sql: "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chatbot_knowledge'"
          });
          
        if (tableError) {
          console.error("Errore nel controllo della tabella:", tableError);
        } else {
          hasKnowledgeTable = tableData && tableData.length > 0;
          console.log("Tabella chatbot_knowledge esiste:", hasKnowledgeTable);
        }
      } catch (e) {
        console.error("Errore nel controllo della tabella:", e);
      }
      
      // Try direct query first
      try {
        const { data: directQueryData, error: directQueryError } = await supabaseClient
          .from('chatbot_knowledge')
          .select('content')
          .limit(5);
          
        if (directQueryError) {
          console.error("Errore nella query diretta:", directQueryError);
        } else if (directQueryData && directQueryData.length > 0) {
          console.log(`Trovati ${directQueryData.length} elementi di conoscenza tramite query diretta`);
          contextText = directQueryData.map((item: any) => item.content).join("\n\n");
          knowledgeFound = true;
        }
      } catch (directQueryError) {
        console.error("Eccezione nella query diretta:", directQueryError);
      }
        
      // Try the vector search if available
      if (hasVectorExtension && hasKnowledgeTable) {
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
            console.log("Procedendo con i risultati della query diretta o risposta predefinita");
          } else if (matchingContent && matchingContent.length > 0) {
            contextText = matchingContent.map((item: any) => item.content).join("\n\n");
            knowledgeFound = true;
            console.log(`Trovati ${matchingContent.length} documenti corrispondenti tramite ricerca vettoriale`);
          } else {
            console.log("Nessun contenuto corrispondente trovato tramite ricerca vettoriale");
          }
        } catch (vectorError) {
          console.error("Eccezione nella ricerca vettoriale:", vectorError);
        }
      } else {
        console.log("Ricerca vettoriale non disponibile. Estensione vector:", hasVectorExtension, 
                    "Tabella knowledge:", hasKnowledgeTable);
      }
    } catch (e) {
      console.error("Errore nella ricerca della knowledge base:", e);
      console.log("Procedendo senza riscontri dalla knowledge base.");
    }

    // Add context about knowledge base status to debug any issues
    if (!knowledgeFound) {
      contextText += "\n\nNota: La knowledge base potrebbe non essere configurata correttamente o potrebbe non contenere informazioni rilevanti per questa domanda.";
    }

    // Build system message based on the language
    let systemPrompt = "";
    
    switch (language) {
      case 'it':
        systemPrompt = `Sei ${chatbotConfig.botName}, un assistente virtuale intelligente progettato per supportare gli ospiti di una struttura ricettiva. Il tuo compito principale è fornire informazioni dettagliate, accurate e tempestive che facilitino e migliorino l'esperienza di soggiorno degli ospiti.

Obiettivi principali:
- Rispondere a domande sulla struttura (orari, servizi, regole)
- Fornire informazioni sugli spazi comuni (piscina, ristorante, ecc.)
- Suggerire opzioni gastronomiche e attrazioni turistiche
- Offrire supporto logistico (indicazioni, trasporti, ecc.)

Regole da seguire:
- Utilizza SOLO le informazioni fornite nel contesto, non inventare dettagli
- Se non conosci la risposta, suggerisci di contattare direttamente la struttura
- Per richieste specifiche, suggerisci di rivolgersi alla reception

Sii cordiale, professionale e fornisci risposte brevi e chiare.`;
        break;
      case 'en':
        systemPrompt = `You are ${chatbotConfig.botName}, an intelligent virtual assistant designed to support guests of an accommodation facility. Your main task is to provide detailed, accurate, and timely information that facilitates and enhances the guests' stay experience.

Main objectives:
- Answer questions about the facility (hours, services, rules)
- Provide information about common areas (pool, restaurant, etc.)
- Suggest dining options and tourist attractions
- Offer logistical support (directions, transportation, etc.)

Rules to follow:
- Use ONLY the information provided in the context, do not make up details
- If you don't know the answer, suggest contacting the facility directly
- For specific requests, suggest speaking to the reception

Be cordial, professional and provide brief, clear responses. ALWAYS answer in English.`;
        break;
      case 'fr':
        systemPrompt = `Vous êtes ${chatbotConfig.botName}, un assistant virtuel intelligent conçu pour soutenir les clients d'un établissement d'hébergement. Votre tâche principale est de fournir des informations détaillées, précises et opportunes qui facilitent et améliorent l'expérience de séjour des clients.

Objectifs principaux:
- Répondre aux questions sur l'établissement (horaires, services, règles)
- Fournir des informations sur les espaces communs (piscine, restaurant, etc.)
- Suggérer des options gastronomiques et des attractions touristiques
- Offrir un soutien logistique (directions, transports, etc.)

Règles à suivre:
- Utilisez UNIQUEMENT les informations fournies dans le contexte, n'inventez pas de détails
- Si vous ne connaissez pas la réponse, suggérez de contacter directement l'établissement
- Pour des demandes spécifiques, suggérez de s'adresser à la réception

Soyez cordial, professionnel et fournissez des réponses brèves et claires. Répondez TOUJOURS en français.`;
        break;
      case 'es':
        systemPrompt = `Eres ${chatbotConfig.botName}, un asistente virtual inteligente diseñado para apoyar a los huéspedes de un establecimiento de alojamiento. Tu tarea principal es proporcionar información detallada, precisa y oportuna que facilite y mejore la experiencia de estancia de los huéspedes.

Objetivos principales:
- Responder a preguntas sobre el establecimiento (horarios, servicios, reglas)
- Proporcionar información sobre áreas comunes (piscina, restaurante, etc.)
- Sugerir opciones gastronómicas y atracciones turísticas
- Ofrecer apoyo logístico (direcciones, transporte, etc.)

Reglas a seguir:
- Utiliza SOLO la información proporcionada en el contexto, no inventes detalles
- Si no conoces la respuesta, sugiere contactar directamente con el establecimiento
- Para solicitudes específicas, sugiere hablar con la recepción

Sé cordial, profesional y proporciona respuestas breves y claras. Responde SIEMPRE en español.`;
        break;
      case 'de':
        systemPrompt = `Sie sind ${chatbotConfig.botName}, ein intelligenter virtueller Assistent, der entwickelt wurde, um Gäste einer Unterkunftseinrichtung zu unterstützen. Ihre Hauptaufgabe ist es, detaillierte, genaue und zeitnahe Informationen zu liefern, die den Aufenthalt der Gäste erleichtern und verbessern.

Hauptziele:
- Beantworten Sie Fragen zur Einrichtung (Öffnungszeiten, Dienstleistungen, Regeln)
- Informationen über Gemeinschaftsbereiche (Pool, Restaurant usw.) bereitstellen
- Gastronomische Optionen und touristische Attraktionen vorschlagen
- Logistische Unterstützung anbieten (Wegbeschreibungen, Transport usw.)

Zu befolgende Regeln:
- Verwenden Sie NUR die im Kontext bereitgestellten Informationen, erfinden Sie keine Details
- Wenn Sie die Antwort nicht kennen, schlagen Sie vor, die Einrichtung direkt zu kontaktieren
- Bei spezifischen Anfragen empfehlen Sie, sich an die Rezeption zu wenden

Seien Sie herzlich, professionell und geben Sie kurze, klare Antworten. Antworten Sie IMMER auf Deutsch.`;
        break;
      default:
        systemPrompt = `You are ${chatbotConfig.botName}, an intelligent virtual assistant designed to support guests of an accommodation facility. Your main task is to provide detailed, accurate, and timely information that facilitates and enhances the guests' stay experience.

Main objectives:
- Answer questions about the facility (hours, services, rules)
- Provide information about common areas (pool, restaurant, etc.)
- Suggest dining options and tourist attractions
- Offer logistical support (directions, transportation, etc.)

Rules to follow:
- Use ONLY the information provided in the context, do not make up details
- If you don't know the answer, suggest contacting the facility directly
- For specific requests, suggest speaking to the reception

Be cordial, professional and provide brief, clear responses. Identify the language of the question and respond in the same language.`;
    }

    // Prepare conversation history for the API call
    const conversationHistory = [
      { role: "system", content: systemPrompt },
      { role: "system", content: `Ecco le informazioni rilevanti dal sito della struttura: ${contextText}` }
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

    // Log the conversation for debugging
    console.log("Cronologia conversazione:", JSON.stringify(conversationHistory));

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
        input: text.slice(0, 8000) // Limit to 8000 characters
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Errore API embedding OpenAI:', data);
      throw new Error(`Errore API embedding OpenAI: ${data.error?.message || 'Errore sconosciuto'}`);
    }
    
    return data.data[0].embedding;
  } catch (error) {
    console.error('Errore nella creazione dell\'embedding:', error);
    return null;
  }
}
