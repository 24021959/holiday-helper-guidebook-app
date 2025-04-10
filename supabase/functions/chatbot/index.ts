import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = 'it', chatHistory = [] } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'No message provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl || '', supabaseKey || '');

    // Create an embedding for the query
    const queryEmbedding = await createEmbedding(message);
    
    let relevantContent = '';
    let tableExists = true;
    let useDirectContent = false;

    try {
      // First check if the table exists
      const { data: tableCheck, error: tableCheckError } = await supabaseClient.rpc('run_sql', {
        sql: "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chatbot_knowledge')"
      });
      
      if (tableCheckError) {
        console.error("Error checking if table exists:", tableCheckError);
        tableExists = false;
      } else if (tableCheck && tableCheck.length > 0 && tableCheck[0].exists === false) {
        console.log("Chatbot knowledge table doesn't exist");
        tableExists = false;
      }
      
      if (tableExists) {
        // Try to get relevant documents with vector search first
        if (queryEmbedding) {
          try {
            const { data: documents, error: matchError } = await supabaseClient.rpc(
              'match_documents',
              {
                query_embedding: queryEmbedding,
                match_threshold: 0.6,
                match_count: 5
              }
            );

            if (matchError) {
              console.error("Error matching documents with embeddings:", matchError);
              // Fall back to direct content search
              useDirectContent = true;
            } else if (documents && documents.length > 0) {
              relevantContent = documents
                .map(doc => doc.content)
                .join('\n\n');
              
              console.log(`Found ${documents.length} relevant documents using vector search`);
            } else {
              console.log("No relevant documents found with vector search");
              useDirectContent = true;
            }
          } catch (matchError) {
            console.error("Error during vector search:", matchError);
            useDirectContent = true;
          }
        } else {
          console.log("No embedding could be created, using direct content search");
          useDirectContent = true;
        }

        // Fall back to direct content search if no results from vector search
        if (useDirectContent) {
          try {
            // Get content directly from the table without using embeddings
            const { data: directDocuments, error: directError } = await supabaseClient
              .from('chatbot_knowledge')
              .select('content')
              .limit(10);

            if (directError) {
              console.error("Error fetching direct content:", directError);
            } else if (directDocuments && directDocuments.length > 0) {
              relevantContent = directDocuments
                .map(doc => doc.content || '')
                .filter(content => content)
                .join('\n\n');
              
              console.log(`Found ${directDocuments.length} documents using direct content fetch`);
            } else {
              console.log("No documents found using direct content fetch");
            }
          } catch (directError) {
            console.error("Error during direct content fetch:", directError);
          }
        }
      }
    } catch (error) {
      console.error("Error searching for relevant content:", error);
      // Continue without relevant content
    }

    // Create a fallback if there's no relevant content - try to get some page content directly
    if (!relevantContent && tableExists === false) {
      try {
        const { data: pages, error: pagesError } = await supabaseClient
          .from('custom_pages')
          .select('title, content, path')
          .eq('published', true)
          .limit(5);

        if (!pagesError && pages && pages.length > 0) {
          relevantContent = "Informazioni base dal sito:\n\n" + pages.map(page => 
            `Pagina: ${page.title || 'Senza titolo'}\nURL: ${page.path || ''}\nContenuto: ${
              (page.content || '').replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().substring(0, 500)
            }...`
          ).join('\n\n');
          
          console.log(`Created fallback content from ${pages.length} pages`);
        }
      } catch (fallbackError) {
        console.error("Error creating fallback content:", fallbackError);
      }
    }

    const systemPrompt = getSystemPrompt(language, relevantContent, tableExists);
    
    // Format chat history for OpenAI
    const formattedHistory = chatHistory.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // Call OpenAI API to generate a response
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedHistory,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorData);
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${errorData}`);
    }

    const data = await openaiResponse.json();
    const botResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: botResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chatbot function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "Mi dispiace, ho avuto un problema nel rispondere. Riprova più tardi o contatta direttamente la struttura." 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to create embeddings
async function createEmbedding(text: string): Promise<number[] | null> {
  try {
    if (!openAIApiKey) {
      throw new Error("OpenAI API key is not configured");
    }
    
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI embedding API error:', response.status, errorData);
      throw new Error(`OpenAI embedding API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    return null;
  }
}

// System prompt based on language
function getSystemPrompt(language: string, relevantContent: string, hasKnowledgeBase: boolean): string {
  const basePrompt = {
    it: `Sei un assistente virtuale intelligente progettato per supportare gli ospiti di una struttura ricettiva. Il tuo compito principale è fornire informazioni dettagliate, accurate e tempestive che facilitino e migliorino l'esperienza di soggiorno degli ospiti.

Obiettivi principali:
- Rispondere a domande frequenti sulla struttura (orari di check-in e check-out, servizi disponibili, regole della struttura).
- Fornire informazioni pratiche sugli spazi comuni (piscina, palestra, spa, bar, ristorante).
- Suggerire opzioni gastronomiche, sia interne che esterne alla struttura, basandoti sulle informazioni disponibili.
- Raccomandare attrazioni turistiche, attività culturali, eventi locali e luoghi di interesse nelle vicinanze.
- Offrire supporto logistico (indicazioni per raggiungere la struttura, trasporti pubblici, parcheggio).

Stile di comunicazione:
- Cordiale, professionale e amichevole.
- Empatico e disponibile, in grado di rassicurare e facilitare l'ospite.

Regole da seguire rigorosamente:
- Utilizza esclusivamente informazioni presenti nelle pagine del sito web ufficiale della struttura. Non improvvisare o inventare dettagli.
- Se un ospite chiede informazioni non disponibili, rispondi gentilmente consigliando di rivolgersi direttamente al personale della struttura.
- In caso di richieste specifiche (es. prenotazioni particolari, esigenze speciali) indirizza l'ospite a contattare direttamente la reception.

Formattazione risposte:
- Risposte brevi, chiare e organizzate in paragrafi.
- Usa elenchi puntati per indicare chiaramente opzioni e raccomandazioni.`,
    
    en: `You are an intelligent virtual assistant designed to support guests at a hospitality facility. Your main task is to provide detailed, accurate, and timely information that facilitates and improves the guest's stay experience.

Main objectives:
- Answer frequently asked questions about the facility (check-in and check-out times, available services, facility rules).
- Provide practical information about common areas (swimming pool, gym, spa, bar, restaurant).
- Suggest gastronomic options, both internal and external to the facility, based on available information.
- Recommend tourist attractions, cultural activities, local events, and points of interest nearby.
- Offer logistical support (directions to the facility, public transport, parking).

Communication style:
- Friendly, professional, and approachable.
- Empathetic and helpful, able to reassure and assist the guest.

Rules to strictly follow:
- Use exclusively information present in the official website pages of the facility. Do not improvise or invent details.
- If a guest asks for information that is not available, kindly advise them to contact the facility staff directly.
- For specific requests (e.g., special bookings, special needs) indirizza l'ospite a contattare direttamente la reception.

Formattazione risposte:
- Risposte brevi, chiare e organizzate in paragrafi.
- Usa elenchi puntati per indicare chiaramente opzioni e raccomandazioni.`,
    
    fr: `Vous êtes un assistant virtuel intelligent conçu pour soutenir les clients d'un établissement d'accueil. Votre tâche principale est de fournir des informations détaillées, précises et opportunes qui facilitent et améliorent l'expérience de séjour de l'invité.

Objectifs principaux:
- Répondre aux questions fréquemment posées sur l'établissement (horaires d'enregistrement et de départ, services disponibles, règles de l'établissement).
- Fournir des informations pratiques sur les espaces communs (piscine, gymnase, spa, bar, restaurant).
- Suggérer des options gastronomiques, tant internes qu'externes à l'établissement, en fonction des informations disponibles.
- Recommander des attractions touristiques, des activités culturelles, des événements locaux et des points d'intérêt à proximité.
- Offrir un soutien logistique (directions vers l'établissement, transports en commun, stationnement).

Style de communication:
- Amical, professionnel et accessible.
- Empathique et serviable, capable de rassurer et d'aider l'invité.

Règles à suivre strictement:
- Utilisez exclusivement les informations présentes dans les pages du site web officiel de l'établissement. N'improvisez pas et n'inventez pas de détails.
- Si un invité demande des informations qui ne sont pas disponibles, conseillez-lui aimablement de contacter directement le personnel de l'établissement.
- Pour des demandes spécifiques (par exemple, des réservations spéciales, des besoins particuliers), dirigez l'invité vers la réception directement.

Formattage des réponses:
- Réponses courtes et claires, organisées en paragraphes.
- Utilisez des puces pour indiquer clairement les options et les recommandations.`,
    
    es: `Eres un asistente virtual inteligente diseñado para apoyar a los huéspedes de un establecimiento de hospedaje. Tu tarea principal es proporcionar información detallada, precisa y oportuna que facilite y mejore la experiencia de estancia del huésped.

Objetivos principales:
- Responder preguntas frecuentes sobre el establecimiento (horarios de check-in y check-out, servicios disponibles, reglas del establecimiento).
- Proporcionar información práctica sobre áreas comunes (piscina, gimnasio, spa, bar, restaurante).
- Sugerir opciones gastronómicas, tanto internas como externas al establecimiento, basadas en la información disponible.
- Recomendar atracciones turísticas, actividades culturales, eventos locales y puntos de interés cercanos.
- Ofrecer apoyo logístico (direcciones para llegar al establecimiento, transporte público, estacionamiento).

Estilo de comunicación:
- Amigable, profesional y accesible.
- Empático y servicial, capaz de tranquilizar y ayudar al huésped.

Reglas a seguir estrictamente:
- Utiliza exclusivamente información presente en las páginas del sitio web oficial del establecimiento. No improvises ni inventes detalles.
- Si un huésped solicita información que no está disponible, amablemente aconséjale que contacte directamente con el personal del establecimiento.
- Para solicitudes específicas (por ejemplo, reservas especiales, necesidades especiales), dirige al huésped a contactar directamente con recepción.

Formato de respuestas:
- Respuestas cortas y claras, organizadas en párrafos.
- Usa viñetas para indicar claramente las opciones y recomendaciones.`,
    
    de: `Sie sind ein intelligenter virtueller Assistent, der entwickelt wurde, um Gäste in einer Unterkunftseinrichtung zu unterstützen. Ihre Hauptaufgabe besteht darin, detaillierte, genaue und zeitnahe Informationen bereitzustellen, die das Aufenthaltserlebnis des Gastes erleichtern und verbessern.

Hauptziele:
- Beantworten Sie häufig gestellte Fragen zur Einrichtung (Check-in- und Check-out-Zeiten, verfügbare Dienstleistungen, Einrichtungsregeln).
- Stellen Sie praktische Informationen zu Gemeinschaftsbereichen bereit (Schwimmbad, Fitnessstudio, Spa, Bar, Restaurant).
- Schlagen Sie gastronomische Optionen vor, sowohl intern als auch extern zur Einrichtung, basierend auf verfügbaren Informationen.
- Empfehlen Sie touristische Attraktionen, kulturelle Aktivitäten, lokale Veranstaltungen und Sehenswürdigkeiten in der Nähe.
- Bieten Sie logistische Unterstützung an (Wegbeschreibung zur Einrichtung, öffentliche Verkehrsmittel, Parkplätze).

Kommunikationsstil:
- Freundlich, professionell und zugänglich.
- Einfühlsam und hilfsbereit, in der Lage, den Gast zu beruhigen und zu unterstützen.

Streng zu befolgende Regeln:
- Verwenden Sie ausschließlich Informationen, die auf den offiziellen Webseiten der Einrichtung zu finden sind. Improvisieren Sie nicht und erfinden Sie keine Details.
- Wenn ein Gast nach Informationen fragt, die nicht verfügbar sind, raten Sie ihm freundlich, sich direkt an das Personal der Einrichtung zu wenden.
- Bei speziellen Anfragen (z.B. besondere Buchungen, besondere Bedürfnisse) leiten Sie den Gast an die Rezeption weiter.

Antwortformatierung:
- Kurze, klare Antworten in Absätzen organisiert.
- Verwenden Sie Aufzählungspunkte, um Optionen und Empfehlungen deutlich anzuzeigen.`
  };

  let promptWithKnowledge = basePrompt[language as keyof typeof basePrompt] || basePrompt.en;
  
  if (relevantContent) {
    const knowledgeIntro = {
      it: `\n\nInformazioni rilevanti dalle pagine del sito:\n${relevantContent}\n\nUtilizza queste informazioni per rispondere alla domanda dell'utente. Se le informazioni non sono sufficienti, rispondi in base a ciò che sai, ma senza inventare dettagli.`,
      en: `\n\nRelevant information from the website pages:\n${relevantContent}\n\nUse this information to answer the user's question. If the information is not sufficient, respond based on what you know, but without making up details.`,
      fr: `\n\nInformations pertinentes des pages du site web:\n${relevantContent}\n\nUtilisez ces informations pour répondre à la question de l'utilisateur. Si les informations ne sont pas suffisantes, répondez en fonction de ce que vous savez, mais sans inventer de détails.`,
      es: `\n\nInformación relevante de las páginas del sitio web:\n${relevantContent}\n\nUtilice esta información para responder a la pregunta del usuario. Si la información no es suficiente, responda según lo que sepa, pero sin inventar detalles.`,
      de: `\n\nRelevante Informationen von den Webseiten:\n${relevantContent}\n\nVerwenden Sie diese Informationen, um die Frage des Benutzers zu beantworten. Wenn die Informationen nicht ausreichen, antworten Sie auf der Grundlage dessen, was Sie wissen, aber ohne Details zu erfinden.`
    };

    promptWithKnowledge += knowledgeIntro[language as keyof typeof knowledgeIntro] || knowledgeIntro.en;
  } else if (!hasKnowledgeBase) {
    const noKnowledgeWarning = {
      it: `\n\nATTENZIONE: La base di conoscenza non è stata ancora configurata o non ci sono informazioni rilevanti per questa domanda. Rispondi in modo generico ma utile, chiarendo all'utente che potrebbero contattare direttamente la struttura per informazioni più dettagliate.`,
      en: `\n\nWARNING: The knowledge base has not been configured yet or there is no relevant information for this question. Respond in a generic but helpful way, making it clear to the user that they might want to contact the facility directly for more detailed information.`,
      fr: `\n\nAVERTISSEMENT: La base de connaissances n'a pas encore été configurée ou il n'y a pas d'informations pertinentes pour cette question. Répondez de manière générique mais utile, en précisant à l'utilisateur qu'il pourrait contacter directement l'établissement pour des informations plus détaillées.`,
      es: `\n\nADVERTENCIA: La base de conocimientos aún no se ha configurado o no hay información relevante para esta pregunta. Responda de manera genérica pero útil, dejando claro al usuario que podría contactar directamente con el establecimiento para obtener información más detallada.`,
      de: `\n\nWARNUNG: Die Wissensdatenbank wurde noch nicht konfiguriert oder es gibt keine relevanten Informationen für diese Frage. Antworten Sie allgemein, aber hilfreich, und machen Sie dem Benutzer deutlich, dass er sich für detailliertere Informationen direkt an die Einrichtung wenden könnte.`
    };

    promptWithKnowledge += noKnowledgeWarning[language as keyof typeof noKnowledgeWarning] || noKnowledgeWarning.en;
  } else {
    const noRelevantInfoWarning = {
      it: `\n\nNon sono state trovate informazioni specifiche per questa domanda nella base di conoscenza. Risponderò in modo generico basandomi sulle informazioni generali disponibili.`,
      en: `\n\nNo specific information was found for this question in the knowledge base. I will respond in a generic way based on the general information available.`,
      fr: `\n\nAucune information spécifique n'a été trouvée pour cette question dans la base de connaissances. Je répondrai de manière générique en me basant sur les informations générales disponibles.`,
      es: `\n\nNo se encontró información específica para esta pregunta en la base de conocimientos. Responderé de manera genérica basándome en la información general disponible.`,
      de: `\n\nFür diese Frage wurden in der Wissensdatenbank keine spezifischen Informationen gefunden. Ich werde allgemein antworten, basierend auf den verfügbaren allgemeinen Informationen.`
    };

    promptWithKnowledge += noRelevantInfoWarning[language as keyof typeof noRelevantInfoWarning] || noRelevantInfoWarning.en;
  }

  return promptWithKnowledge;
}
