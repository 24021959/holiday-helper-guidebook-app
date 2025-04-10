
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

    // Miglioramento: Aggiungi ricerca diretta per informazioni specifiche come orari, piscina, etc.
    const specificKeywords = {
      "piscina": ["orari", "apertura", "chiusura", "ora", "apre", "chiude", "vasca", "nuotare"],
      "orari": ["apertura", "chiusura", "apre", "chiude", "ora", "dalle", "alle", "mattina", "pomeriggio", "sera"],
      "colazione": ["orari", "ora", "quando", "mattina", "dalle", "alle"],
      "servizi": ["hotel", "albergo", "incluso", "gratuito", "offrire", "disponibile"],
      "check-in": ["orari", "ora", "quando", "dalle", "alle"],
      "check-out": ["orari", "ora", "quando", "dalle", "alle"],
    };

    // Verifica se la domanda contiene parole chiave specifiche
    const messageWords = message.toLowerCase().split(/\s+/);
    const matchingCategories = Object.entries(specificKeywords)
      .filter(([category, keywords]) => {
        // Verifica se la categoria è presente nella domanda
        if (messageWords.includes(category)) return true;
        // Verifica se almeno una delle parole chiave è presente nella domanda
        return keywords.some(keyword => messageWords.includes(keyword));
      })
      .map(([category]) => category);

    console.log("Categorie individuate nella domanda:", matchingCategories);
    
    // Array per memorizzare informazioni trovate e la loro rilevanza
    let relevantDocuments = [];
    let fallbackDocuments = [];
    let contextText = ""; 
    
    try {
      console.log("Inizio della ricerca di informazioni rilevanti con embedding di lunghezza:", questionEmbedding.length);
      
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
      
      // Prima strategia: ricerca vettoriale (semantica) combinata con ricerca testuale
      if (hasKnowledgeTable) {
        try {
          console.log("Esecuzione della ricerca combinata con embedding e testo della query:", message);
          
          // Imposta una soglia più bassa per la corrispondenza e ottieni più risultati
          // specialmente se la domanda riguarda categorie specifiche come gli orari
          const matchThreshold = matchingCategories.length > 0 ? 0.45 : 0.55;
          const matchCount = matchingCategories.length > 0 ? 20 : 12;
          
          // Chiamiamo la funzione match_documents con il testo della query
          const { data: matchingContent, error: matchError } = await supabaseClient.rpc(
            'match_documents',
            {
              query_embedding: questionEmbedding,
              match_threshold: matchThreshold,   
              match_count: matchCount,       
              query_text: message       
            }
          );

          if (matchError) {
            console.error("Errore nella ricerca combinata:", matchError);
            
            // Fallback alla vecchia funzione se la nuova non è disponibile
            const { data: legacyContent, error: legacyError } = await supabaseClient.rpc(
              'match_documents',
              {
                query_embedding: questionEmbedding,
                match_threshold: matchThreshold,
                match_count: matchCount
              }
            );
            
            if (legacyError) {
              console.error("Errore anche nella ricerca legacy:", legacyError);
            } else if (legacyContent && legacyContent.length > 0) {
              relevantDocuments = legacyContent.sort((a, b) => b.similarity - a.similarity);
              console.log(`Trovati ${relevantDocuments.length} documenti corrispondenti tramite ricerca legacy`);
            }
          } else if (matchingContent && matchingContent.length > 0) {
            // Ordina i risultati per rilevanza
            relevantDocuments = matchingContent.sort((a, b) => b.similarity - a.similarity);
            console.log(`Trovati ${relevantDocuments.length} documenti corrispondenti tramite ricerca combinata`);
            
            // Estrai informazioni sulla rilevanza per il debugging
            console.log("Top 5 documenti per rilevanza:", 
              relevantDocuments.slice(0, 5).map(doc => ({
                titolo: doc.title,
                tipo: doc.content_type || 'default',
                sezione: doc.section_title || 'N/A',
                similarità: doc.similarity.toFixed(3),
                anteprima: doc.content.substring(0, 100) + "..."
              }))
            );
          } else {
            console.log("Nessun contenuto corrispondente trovato tramite ricerca combinata");
          }
        } catch (vectorError) {
          console.error("Errore nella ricerca combinata:", vectorError);
        }
        
        // Ricerca aggiuntiva per categorie specifiche come orari, piscina, etc.
        if (matchingCategories.length > 0) {
          try {
            console.log(`Esecuzione ricerca specifica per categorie: ${matchingCategories.join(", ")}`);
            
            // Costruisci una condizione di ricerca avanzata
            let textQuery = supabaseClient
              .from('chatbot_knowledge')
              .select('*');
            
            // Aggiungi filtri per ogni categoria
            let searchConditions = matchingCategories.map(category => {
              return `content.ilike.%${category}%`;
            });
            
            // Aggiungi anche filtri per parole chiave associate
            matchingCategories.forEach(category => {
              if (specificKeywords[category]) {
                specificKeywords[category].forEach(keyword => {
                  searchConditions.push(`content.ilike.%${keyword}%`);
                });
              }
            });
            
            // Esegui una ricerca OR su tutte le condizioni
            textQuery = textQuery.or(searchConditions.join(','));
            
            // Ordina per recency e limita i risultati
            textQuery = textQuery.order('created_at', { ascending: false });
            textQuery = textQuery.limit(15);
            
            const { data: specificResults, error: specificError } = await textQuery;
            
            if (specificError) {
              console.error("Errore nella ricerca specifica per categorie:", specificError);
            } else if (specificResults && specificResults.length > 0) {
              console.log(`Trovati ${specificResults.length} risultati specifici per categorie`);
              
              // Priorizza questi risultati
              specificResults.forEach(doc => {
                // Aggiungi solo se non è già presente
                if (!relevantDocuments.some(d => d.id === doc.id)) {
                  relevantDocuments.push({
                    ...doc,
                    similarity: 0.9,  // Alta priorità per risultati specifici
                    content_type: 'specific_result'
                  });
                }
              });
            }
          } catch (specificError) {
            console.error("Errore nella ricerca specifica per categorie:", specificError);
          }
        }
        
        // Ricerca testuale diretta come supporto ulteriore
        if (relevantDocuments.length < 3) {
          try {
            console.log("Ricerca combinata insufficiente, tentativo con ricerca testuale diretta");
            
            // Creiamo un array di parole da cercare
            const searchTerms = message
              .toLowerCase()
              .replace(/[^\w\sàèìòùáéíóúÀÈÌÒÙÁÉÍÓÚ]/g, ' ')  // Mantieni solo lettere, numeri e spazi
              .split(/\s+/)
              .filter(word => word.length > 2);  // Filtra parole troppo brevi
              
            if (searchTerms.length > 0) {
              // Costruisci un filtro OR per tutti i termini di ricerca
              let query = supabaseClient
                .from('chatbot_knowledge')
                .select('*');
                
              let orConditions = searchTerms.map(term => `content.ilike.%${term}%`);
              
              query = query.or(orConditions.join(','));
              query = query.order('created_at', { ascending: false });
              query = query.limit(10);
              
              const { data: textSearchResults, error: textSearchError } = await query;
              
              if (textSearchError) {
                console.error("Errore nella ricerca testuale diretta:", textSearchError);
              } else if (textSearchResults && textSearchResults.length > 0) {
                console.log(`Trovati ${textSearchResults.length} risultati tramite ricerca testuale diretta`);
                
                // Aggiungi questi risultati come fallback
                textSearchResults.forEach(doc => {
                  if (!relevantDocuments.some(d => d.id === doc.id)) {
                    fallbackDocuments.push({
                      ...doc,
                      similarity: 0.4  // Valore arbitrario più basso per ricerca di fallback
                    });
                  }
                });
              }
            }
          } catch (textSearchError) {
            console.error("Errore nella ricerca testuale diretta:", textSearchError);
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
            .limit(5);
            
          if (pagesError) {
            console.error("Errore nel recupero delle pagine:", pagesError);
          } else if (pagesData && pagesData.length > 0) {
            console.log(`Utilizzando ${pagesData.length} pagine come fallback per il contesto`);
            fallbackDocuments = pagesData.map((item, index) => ({
              id: index.toString(),
              title: item.title,
              content: (item.content || "").replace(/<[^>]*>/g, " ").trim(),
              similarity: 0.3  // Valore basso arbitrario
            }));
          }
        } catch (pagesError) {
          console.error("Errore nel recupero delle pagine:", pagesError);
        }
      }
      
      // Combina i risultati principali con quelli di fallback, mantenendo la priorità
      let allDocuments = [...relevantDocuments];
      
      // Aggiungi i documenti di fallback solo se non abbiamo abbastanza documenti rilevanti
      if (allDocuments.length < 5 && fallbackDocuments.length > 0) {
        console.log(`Aggiunta di ${fallbackDocuments.length} documenti di fallback al contesto`);
        allDocuments.push(...fallbackDocuments);
      }
      
      // Miglioramento: Se la domanda era specifica su orari, evidenzia tutte le informazioni sugli orari trovate
      if (matchingCategories.includes('orari') || matchingCategories.includes('piscina')) {
        // Filtra per frammenti che contengono informazioni sugli orari
        const timeRelatedDocs = allDocuments.filter(doc => 
          doc.content.toLowerCase().includes('orari') || 
          doc.content.toLowerCase().includes('orario') ||
          doc.content.toLowerCase().includes('aperto') ||
          doc.content.toLowerCase().includes('chiuso') ||
          doc.content.toLowerCase().includes('dalle') ||
          doc.content.toLowerCase().includes('alle') ||
          /\d{1,2}:\d{2}/.test(doc.content) // Cerca pattern di orari (es. 9:30)
        );
        
        console.log(`Trovati ${timeRelatedDocs.length} documenti contenenti informazioni su orari`);
        
        // Se abbiamo trovato informazioni sugli orari, mettiamole in cima
        if (timeRelatedDocs.length > 0) {
          // Rimuovi questi documenti da allDocuments
          allDocuments = allDocuments.filter(doc => 
            !timeRelatedDocs.some(timeDoc => timeDoc.id === doc.id)
          );
          
          // Poi mettili in cima con alta priorità
          allDocuments = [
            ...timeRelatedDocs.map(doc => ({...doc, similarity: 0.95})),
            ...allDocuments
          ];
        }
      }
      
      // Organizza i documenti in base a sezioni e ordine originale
      if (allDocuments.length > 0) {
        // Ordina per sezione e posizione originale se disponibili
        allDocuments.sort((a, b) => {
          // Prima ordina per tipo di contenuto (prioritizzando i risultati specifici)
          if (a.content_type === 'specific_result' && b.content_type !== 'specific_result') {
            return -1;
          }
          if (a.content_type !== 'specific_result' && b.content_type === 'specific_result') {
            return 1;
          }
          
          // Poi per sezione
          if (a.section_title && b.section_title && a.section_title !== b.section_title) {
            return a.section_title.localeCompare(b.section_title);
          }
          
          // Poi per posizione originale
          if (a.original_position !== undefined && b.original_position !== undefined) {
            return a.original_position - b.original_position;
          }
          
          // Infine per similarità
          return b.similarity - a.similarity;
        });
        
        // Formatta il contesto per l'AI evidenziando le informazioni specifiche richieste
        contextText = "--- INFORMAZIONI RILEVANTI DAL SITO ---\n\n";
        
        // Se ci sono categorie specifiche nella domanda, evidenziamole
        if (matchingCategories.length > 0) {
          contextText += `ATTENZIONE: L'utente sta chiedendo informazioni specifiche su: ${matchingCategories.join(", ")}. `;
          contextText += "Fornisci risposte dirette e precise utilizzando i dettagli seguenti, se disponibili.\n\n";
        }
        
        // Identifica le sezioni uniche
        const uniqueSections = [...new Set(allDocuments
          .filter(doc => doc.section_title)
          .map(doc => doc.section_title))];
        
        // Per ogni sezione, raggruppa i documenti correlati
        if (uniqueSections.length > 0) {
          uniqueSections.forEach(section => {
            // Documenti per questa sezione
            const sectionDocs = allDocuments.filter(doc => doc.section_title === section);
            
            if (sectionDocs.length > 0) {
              // Aggiungi il titolo della sezione
              contextText += `### ${section} ###\n`;
              
              // Aggiungi i contenuti
              sectionDocs.forEach(doc => {
                contextText += `${doc.content}\n\n`;
              });
              
              contextText += "\n";
            }
          });
          
          // Aggiungi documenti senza sezione
          const noSectionDocs = allDocuments.filter(doc => !doc.section_title);
          if (noSectionDocs.length > 0) {
            contextText += "### ALTRE INFORMAZIONI RILEVANTI ###\n";
            noSectionDocs.forEach(doc => {
              contextText += `${doc.title}: ${doc.content}\n\n`;
            });
          }
        } else {
          // Formato classico se non ci sono sezioni
          contextText += allDocuments.map((item, index) => {
            const pathInfo = item.path ? `[Pagina: ${item.path}]` : '';
            return `--- DOCUMENTO ${index + 1} ${pathInfo} ---\nTitolo: ${item.title}\nContenuto:\n${item.content}\n`;
          }).join("\n\n");
        }
        
        console.log(`Contesto finale composto da ${allDocuments.length} documenti organizzati`);
      } else {
        contextText = "Non sono disponibili informazioni specifiche su questo argomento nel database del sito.";
        console.log("Nessun documento rilevante trovato, usando messaggio di fallback");
      }
    } catch (e) {
      console.error("Errore nella ricerca della knowledge base:", e);
      contextText = "Si è verificato un errore nella ricerca delle informazioni. Riprova con una domanda diversa o contatta l'amministratore del sito.";
    }

    // Costruisci il messaggio di sistema in base alla lingua con istruzioni migliorate
    let systemPrompt = "";
    
    // Funzione per ottenere il prompt di sistema migliorato in base alla lingua
    const getSystemPrompt = (lang) => {
      const botName = chatbotConfig.botName || "Assistente Virtuale";
      
      // Prompt base comune a tutte le lingue (verrà tradotto)
      const basePrompt = {
        it: `Sei ${botName}, un assistente AI specializzato che rappresenta questo sito web e aiuta i visitatori.
          Il tuo compito è fornire informazioni accurate basate ESCLUSIVAMENTE sui contenuti del sito web forniti nel contesto seguente.
          
          LINEE GUIDA IMPORTANTI:
          1. Rispondi SEMPRE in italiano in modo professionale ma cordiale.
          2. Usa SOLO le informazioni presenti nel contesto fornito.
          3. Se non trovi informazioni sufficienti nel contesto, ammettilo onestamente e suggerisci di contattare direttamente la struttura.
          4. MAI inventare informazioni non presenti nel contesto (prezzi, orari, servizi, ecc.).
          5. Sii preciso nelle risposte, citando specifiche sezioni dei documenti forniti quando possibile.
          6. Mantieni risposte concise ma complete (massimo 150 parole).
          7. Non menzionare mai che stai usando un "contesto" o "documenti" nelle tue risposte; semplicemente fornisci l'informazione.
          8. Se l'utente chiede dettagli specifici (come orari di apertura, tariffe, ecc.) che si trovano nel contesto, assicurati di fornirli con precisione.
          9. Cerca attentamente nel contesto qualsiasi menzione di ORARI, particolarmente per servizi come la PISCINA, COLAZIONE, ecc. e riportali esattamente come sono indicati.
          10. Se l'utente chiede di orari specifici (es. piscina, ristorante), ma non trovi informazioni esplicite, non dire genericamente che non ci sono informazioni, ma suggerisci di contattare la struttura per dettagli precisi.
          
          Comunica in modo naturale come se fossi un rappresentante reale del sito.`,
          
        en: `You are ${botName}, a specialized AI assistant representing this website and helping visitors.
          Your task is to provide accurate information based EXCLUSIVELY on the website content provided in the following context.
          
          IMPORTANT GUIDELINES:
          1. ALWAYS answer in English in a professional but friendly manner.
          2. Use ONLY information present in the provided context.
          3. If you can't find sufficient information in the context, honestly admit it and suggest contacting the establishment directly.
          4. NEVER make up information not present in the context (prices, hours, services, etc.).
          5. Be precise in your answers, citing specific sections of the provided documents when possible.
          6. Keep responses concise but complete (maximum 150 words).
          7. Never mention that you are using a "context" or "documents" in your responses; simply provide the information.
          8. If the user asks for specific details (like opening hours, rates, etc.) that are in the context, make sure to provide them accurately.
          9. Be particularly careful to accurately answer questions about HOURS, SERVICES, AVAILABILITY, and BOOKINGS using the provided data.
          10. Always search in the appropriate sections of the context to find specific information requested by the user.
          
          Communicate naturally as if you were a real representative of the website.`,
          
        fr: `Vous êtes ${botName}, un assistant IA spécialisé représentant ce site web et aidant les visiteurs.
          Votre tâche est de fournir des informations précises basées EXCLUSIVEMENT sur le contenu du site web fourni dans le contexte suivant.
          
          DIRECTIVES IMPORTANTES:
          1. Répondez TOUJOURS en français de manière professionnelle mais amicale.
          2. Utilisez UNIQUEMENT les informations présentes dans le contexte fourni.
          3. Si vous ne trouvez pas d'informations suffisantes dans le contexte, admettez-le honnêtement et suggérez de contacter directement l'établissement.
          4. Ne JAMAIS inventer des informations non présentes dans le contexte (prix, horaires, services, etc.).
          5. Soyez précis dans vos réponses, en citant des sections spécifiques des documents fournis lorsque c'est possible.
          6. Gardez des réponses concises mais complètes (maximum 150 mots).
          7. Ne mentionnez jamais que vous utilisez un "contexte" ou des "documents" dans vos réponses; fournissez simplement l'information.
          8. Si l'utilisateur demande des détails spécifiques (comme les heures d'ouverture, les tarifs, etc.) qui se trouvent dans le contexte, assurez-vous de les fournir avec précision.
          9. Soyez particulièrement attentif à répondre précisément aux questions sur les HORAIRES, SERVICES, DISPONIBILITÉS et RÉSERVATIONS en utilisant les données fournies.
          10. Recherchez toujours dans les sections appropriées du contexte pour trouver les informations spécifiques demandées par l'utilisateur.
          
          Communiquez naturellement comme si vous étiez un véritable représentant du site web.`,
          
        es: `Eres ${botName}, un asistente de IA especializado que representa este sitio web y ayuda a los visitantes.
          Tu tarea es proporcionar información precisa basada EXCLUSIVAMENTE en el contenido del sitio web proporcionado en el siguiente contexto.
          
          PAUTAS IMPORTANTES:
          1. Responde SIEMPRE en español de manera profesional pero amigable.
          2. Utiliza SOLO la información presente en el contexto proporcionado.
          3. Si no encuentras información suficiente en el contexto, admítelo honestamente y sugiere contactar directamente con el establecimiento.
          4. NUNCA inventes información que no esté presente en el contexto (precios, horarios, servicios, etc.).
          5. Sé preciso en tus respuestas, citando secciones específicas de los documentos proporcionados cuando sea posible.
          6. Mantén respuestas concisas pero completas (máximo 150 palabras).
          7. Nunca menciones que estás utilizando un "contexto" o "documentos" en tus respuestas; simplemente proporciona la información.
          8. Si el usuario solicita detalles específicos (como horarios de apertura, tarifas, etc.) que se encuentran en el contexto, asegúrate de proporcionarlos con precisión.
          9. Sé particularmente cuidadoso al responder con precisión a preguntas sobre HORARIOS, SERVICIOS, DISPONIBILIDAD y RESERVAS utilizando los datos proporcionados.
          10. Busca siempre en las secciones apropiadas del contexto para encontrar la información específica solicitada por el usuario.
          
          Comunícate de forma natural como si fueras un representante real del sitio web.`,
          
        de: `Sie sind ${botName}, ein spezialisierter KI-Assistent, der diese Website repräsentiert und Besuchern hilft.
          Ihre Aufgabe ist es, genaue Informationen zu liefern, die AUSSCHLIESSLICH auf den im folgenden Kontext bereitgestellten Website-Inhalten basieren.
          
          WICHTIGE RICHTLINIEN:
          1. Antworten Sie IMMER auf Deutsch in einer professionellen, aber freundlichen Art und Weise.
          2. Verwenden Sie NUR Informationen, die im bereitgestellten Kontext vorhanden sind.
          3. Wenn Sie im Kontext nicht genügend Informationen finden, geben Sie dies ehrlich zu und schlagen Sie vor, die Einrichtung direkt zu kontaktieren.
          4. Erfinden Sie NIEMALS Informationen, die nicht im Kontext vorhanden sind (Preise, Öffnungszeiten, Dienstleistungen usw.).
          5. Seien Sie präzise in Ihren Antworten und zitieren Sie nach Möglichkeit bestimmte Abschnitte der bereitgestellten Dokumente.
          6. Halten Sie die Antworten prägnant, aber vollständig (maximal 150 Wörter).
          7. Erwähnen Sie in Ihren Antworten niemals, dass Sie einen "Kontext" oder "Dokumente" verwenden; geben Sie einfach die Information.
          8. Wenn der Benutzer nach spezifischen Details fragt (wie Öffnungszeiten, Preise usw.), die sich im Kontext befinden, stellen Sie sicher, dass Sie diese genau bereitstellen.
          9. Achten Sie besonders darauf, Fragen zu ÖFFNUNGSZEITEN, DIENSTLEISTUNGEN, VERFÜGBARKEIT und BUCHUNGEN anhand der bereitgestellten Daten genau zu beantworten.
          10. Suchen Sie immer in den entsprechenden Abschnitten des Kontexts nach spezifischen Informationen, die vom Benutzer angefordert werden.
          
          Kommunizieren Sie natürlich, als wären Sie ein echter Vertreter der Website.`
      };
      
      return basePrompt[lang] || basePrompt.it;
    };
    
    // Imposta il prompt di sistema in base alla lingua richiesta
    systemPrompt = getSystemPrompt(language);

    // Istruzioni per il contesto migliorato
    const contextInstructions = {
      it: `Ho raccolto le seguenti informazioni dal sito web per aiutarti a rispondere alla domanda dell'utente. Usa queste informazioni come base per la tua risposta:\n\n${contextText}`,
      en: `I've gathered the following information from the website to help you answer the user's question. Use this information as the basis for your response:\n\n${contextText}`,
      fr: `J'ai recueilli les informations suivantes du site web pour vous aider à répondre à la question de l'utilisateur. Utilisez ces informations comme base pour votre réponse:\n\n${contextText}`,
      es: `He recopilado la siguiente información del sitio web para ayudarte a responder a la pregunta del usuario. Utiliza esta información como base para tu respuesta:\n\n${contextText}`,
      de: `Ich habe die folgenden Informationen von der Website gesammelt, um Ihnen bei der Beantwortung der Benutzerfrage zu helfen. Verwenden Sie diese Informationen als Grundlage für Ihre Antwort:\n\n${contextText}`
    };

    // Prepara la cronologia della conversazione per la chiamata API
    const conversationHistory = [
      { role: "system", content: systemPrompt },
      { role: "system", content: contextInstructions[language] || contextInstructions.it }
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
    console.log("Numero totale di messaggi nella conversazione:", conversationHistory.length);

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
        temperature: 0.5,
        max_tokens: 600,
        top_p: 0.9,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Errore API OpenAI:', data);
      throw new Error(`Errore API OpenAI: ${data.error?.message || 'Errore sconosciuto'}`);
    }
    
    const botResponse = data.choices[0].message.content;
    console.log("Risposta generata con successo, lunghezza:", botResponse.length);

    return new Response(
      JSON.stringify({ response: botResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Errore nella funzione chatbot:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: "Mi dispiace, si è verificato un errore nel processare la tua richiesta. Riprova più tardi o contatta l'amministratore del sito."
      }),
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
