
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

// Migliorata la funzione per verificare e configurare il database
async function setupDatabase(client: any): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Inizializzazione setup del database...");
    
    // Verifica se l'estensione vector esiste
    try {
      const { data: hasVectorExtension, error: extensionError } = await client.rpc('check_vector_extension');
      
      if (extensionError) {
        console.error("Errore nel controllo dell'estensione vector:", extensionError);
        // Continuiamo comunque, potrebbe essere che la funzione non esista ancora
      } else {
        console.log("L'estensione vector esiste:", hasVectorExtension);
        
        if (!hasVectorExtension) {
          // Prova a creare l'estensione vector se non esiste
          try {
            await client.rpc('execute_sql', {
              sql_command: "CREATE EXTENSION IF NOT EXISTS vector;"
            });
            console.log("Estensione vector creata con successo");
          } catch (createExtError) {
            console.error("Errore nella creazione dell'estensione vector:", createExtError);
            return { 
              success: false, 
              error: `Impossibile creare l'estensione vector: ${createExtError.message || JSON.stringify(createExtError)}` 
            };
          }
        }
      }
    } catch (e) {
      console.error("Eccezione nel controllo dell'estensione vector:", e);
      // Continuiamo comunque, potrebbe essere che la funzione non esista ancora
    }
    
    // Verifica se la tabella chatbot_knowledge esiste
    try {
      const { data: tableExists, error: tableCheckError } = await client.rpc('table_exists', {
        table_name: 'chatbot_knowledge'
      });
      
      if (tableCheckError) {
        console.error("Errore nel controllo dell'esistenza della tabella:", tableCheckError);
        console.log("Tentativo di creazione della tabella comunque...");
      } else {
        console.log("La tabella chatbot_knowledge esiste:", tableExists);
      }
      
      // Crea la tabella se non esiste o se abbiamo avuto un errore nel controllo
      try {
        await client.rpc('execute_sql', {
          sql_command: `
            CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              page_id uuid NOT NULL,
              title text NOT NULL,
              content text NOT NULL,
              path text NOT NULL,
              embedding vector(1536),
              created_at timestamp with time zone DEFAULT now(),
              updated_at timestamp with time zone DEFAULT now(),
              content_type text DEFAULT 'paragraph',
              section_title text,
              original_position integer,
              keywords text[]
            );
            
            CREATE INDEX IF NOT EXISTS chatbot_knowledge_path_idx ON public.chatbot_knowledge(path);
            CREATE INDEX IF NOT EXISTS chatbot_knowledge_title_idx ON public.chatbot_knowledge(title);
            CREATE INDEX IF NOT EXISTS chatbot_knowledge_content_gin_idx ON public.chatbot_knowledge USING gin(to_tsvector('italian', content));
            CREATE INDEX IF NOT EXISTS chatbot_knowledge_keywords_idx ON public.chatbot_knowledge USING gin(keywords);
          `
        });
        console.log("Tabella chatbot_knowledge creata o già esistente con indici migliorati");
      } catch (createTableError) {
        console.error("Errore nella creazione della tabella:", createTableError);
        return { 
          success: false, 
          error: `Impossibile creare la tabella chatbot_knowledge: ${createTableError.message || JSON.stringify(createTableError)}` 
        };
      }
      
      // Crea o aggiorna la funzione match_documents con miglioramenti
      try {
        await client.rpc('execute_sql', {
          sql_command: `
            CREATE OR REPLACE FUNCTION public.match_documents(
              query_embedding vector(1536),
              match_threshold float,
              match_count int,
              query_text text DEFAULT NULL
            )
            RETURNS TABLE(
              id uuid,
              page_id uuid,
              title text,
              content text,
              path text,
              similarity float,
              content_type text,
              section_title text,
              original_position integer
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
              tsquery_expression tsquery;
            BEGIN
              -- Se è fornito il testo della query, crea una tsquery
              IF query_text IS NOT NULL THEN
                tsquery_expression := to_tsquery('italian', 
                  (SELECT STRING_AGG(lexeme || ':*', ' & ') 
                   FROM unnest(regexp_split_to_array(
                     regexp_replace(query_text, '[^a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúÁÉÍÓÚ]', ' ', 'g'), 
                     E'\\s+'
                   )) AS t(lexeme) 
                   WHERE length(lexeme) > 2)
                );
              END IF;
              
              RETURN QUERY
              WITH vector_matches AS (
                SELECT
                  "chatbot_knowledge"."id",
                  "chatbot_knowledge"."page_id",
                  "chatbot_knowledge"."title",
                  "chatbot_knowledge"."content",
                  "chatbot_knowledge"."path",
                  "chatbot_knowledge"."content_type",
                  "chatbot_knowledge"."section_title",
                  "chatbot_knowledge"."original_position",
                  1 - ("chatbot_knowledge"."embedding" <=> query_embedding) AS "vector_similarity"
                FROM
                  "chatbot_knowledge"
                WHERE
                  "chatbot_knowledge"."embedding" IS NOT NULL AND
                  1 - ("chatbot_knowledge"."embedding" <=> query_embedding) > match_threshold
                LIMIT match_count
              ),
              text_matches AS (
                SELECT
                  "chatbot_knowledge"."id",
                  "chatbot_knowledge"."page_id",
                  "chatbot_knowledge"."title",
                  "chatbot_knowledge"."content",
                  "chatbot_knowledge"."path",
                  "chatbot_knowledge"."content_type",
                  "chatbot_knowledge"."section_title",
                  "chatbot_knowledge"."original_position",
                  ts_rank_cd(to_tsvector('italian', "chatbot_knowledge"."content"), tsquery_expression) AS "text_similarity"
                FROM
                  "chatbot_knowledge"
                WHERE
                  query_text IS NOT NULL AND
                  tsquery_expression IS NOT NULL AND
                  to_tsvector('italian', "chatbot_knowledge"."content") @@ tsquery_expression
                LIMIT match_count
              ),
              keyword_matches AS (
                SELECT
                  "chatbot_knowledge"."id",
                  "chatbot_knowledge"."page_id",
                  "chatbot_knowledge"."title",
                  "chatbot_knowledge"."content",
                  "chatbot_knowledge"."path",
                  "chatbot_knowledge"."content_type",
                  "chatbot_knowledge"."section_title",
                  "chatbot_knowledge"."original_position",
                  0.8 AS "keyword_similarity"
                FROM
                  "chatbot_knowledge"
                WHERE
                  query_text IS NOT NULL AND
                  "chatbot_knowledge"."keywords" && (
                    SELECT array_agg(lexeme)
                    FROM unnest(regexp_split_to_array(lower(query_text), E'\\s+')) AS t(lexeme)
                    WHERE length(lexeme) > 2
                  )
                LIMIT match_count
              ),
              combined_matches AS (
                SELECT 
                  id, page_id, title, content, path, content_type, section_title, original_position, 
                  vector_similarity AS similarity,
                  'vector' AS match_type
                FROM vector_matches
                UNION ALL
                SELECT 
                  id, page_id, title, content, path, content_type, section_title, original_position, 
                  text_similarity AS similarity,
                  'text' AS match_type
                FROM text_matches 
                WHERE query_text IS NOT NULL
                UNION ALL
                SELECT 
                  id, page_id, title, content, path, content_type, section_title, original_position, 
                  keyword_similarity AS similarity,
                  'keyword' AS match_type
                FROM keyword_matches
                WHERE query_text IS NOT NULL
              ),
              ranked_matches AS (
                SELECT 
                  id, page_id, title, content, path, content_type, section_title, original_position,
                  similarity,
                  ROW_NUMBER() OVER (PARTITION BY id ORDER BY similarity DESC) AS rank
                FROM combined_matches
              )
              SELECT 
                id, page_id, title, content, path, similarity, content_type, section_title, original_position
              FROM ranked_matches
              WHERE rank = 1
              ORDER BY 
                CASE WHEN content_type = 'section_title' THEN 0
                     WHEN content_type = 'list_item' THEN 1
                     ELSE 2 END,
                similarity DESC,
                original_position ASC
              LIMIT match_count;
            END;
            $$;
          `
        });
        console.log("Funzione match_documents creata o aggiornata con supporto per ricerca testuale e parole chiave");
      } catch (createFuncError) {
        console.error("Errore nella creazione della funzione match_documents:", createFuncError);
        return { 
          success: false, 
          error: `Impossibile creare la funzione match_documents: ${createFuncError.message || JSON.stringify(createFuncError)}` 
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Errore nella configurazione degli oggetti del database:", error);
      return { 
        success: false, 
        error: `Errore generale nella configurazione del database: ${error.message || JSON.stringify(error)}` 
      };
    }
  } catch (error) {
    console.error("Errore nel setup del database:", error);
    return { 
      success: false, 
      error: `Errore generale nel setup del database: ${error.message || JSON.stringify(error)}` 
    };
  }
}

// Funzione per estrarre parole chiave dal testo
function extractKeywords(text: string): string[] {
  // Normalizza il testo e rimuovi parole comuni in italiano
  const stopwords = new Set([
    "il", "lo", "la", "i", "gli", "le", "un", "una", "del", "della", 
    "e", "ed", "o", "a", "in", "con", "su", "per", "tra", "fra", "di", 
    "da", "al", "dal", "alla", "dalla", "che", "chi", "cui", "non", "si",
    "è", "sono", "sei", "siamo", "siete", "ho", "hai", "ha", "abbiamo", 
    "avete", "hanno", "come", "dove", "quando", "perché", "questo", 
    "questa", "questi", "queste", "quello", "quella", "quelli", "quelle"
  ]);
  
  // Pulisce il testo e normalizzalo
  const cleanedText = text.toLowerCase()
    .replace(/[^\wàèìòùáéíóúÀÈÌÒÙÁÉÍÓÚ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Estrai le parole, filtra le stopwords e parole corte
  const words = cleanedText.split(' ')
    .filter(word => word.length > 2 && !stopwords.has(word));
  
  // Rimuovi duplicati
  return [...new Set(words)];
}

// Funzione per estrarre i dati strutturati dall'HTML
function extractStructuredContent(html: string): { title: string | null; sections: { title: string; content: string }[] } {
  // Rimuovi prima i tag script e style
  const cleanedHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Rileva i tag h1, h2, h3, h4, h5, h6, p, ul, ol, li, table, tr, td
  const headingPattern = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
  const paragraphPattern = /<p[^>]*>(.*?)<\/p>/gi;
  const listItemPattern = /<li[^>]*>(.*?)<\/li>/gi;
  const tableRowPattern = /<tr[^>]*>(.*?)<\/tr>/gi;
  const tableDataPattern = /<td[^>]*>(.*?)<\/td>/gi;
  
  // Array per tenere traccia dei contenuti strutturati
  const sections: { title: string; content: string }[] = [];
  let currentTitle = "Contenuto Generale";
  let currentContent: string[] = [];
  
  // Estrai intestazioni e usa come titoli di sezione
  let match;
  let lastIndex = 0;
  
  // Prima estrai tutti i tag h1-h6 come potenziali titoli di sezione
  const headings: {title: string; index: number}[] = [];
  while ((match = headingPattern.exec(cleanedHtml)) !== null) {
    const title = match[1].replace(/<[^>]*>/g, '').trim();
    if (title) {
      headings.push({
        title: title,
        index: match.index
      });
    }
  }
  
  // Aggiungi un'intestazione finale fittizia per catturare tutto il contenuto fino alla fine
  headings.push({
    title: "Fine Documento",
    index: cleanedHtml.length
  });
  
  // Ora elabora ogni sezione tra le intestazioni
  for (let i = 0; i < headings.length - 1; i++) {
    const currentHeading = headings[i];
    const nextHeading = headings[i + 1];
    
    const sectionTitle = currentHeading.title;
    const sectionHtml = cleanedHtml.substring(currentHeading.index, nextHeading.index);
    
    // Estrai paragrafi
    const paragraphs: string[] = [];
    while ((match = paragraphPattern.exec(sectionHtml)) !== null) {
      const text = match[1].replace(/<[^>]*>/g, '').trim();
      if (text) paragraphs.push(text);
    }
    
    // Estrai elementi di lista
    const listItems: string[] = [];
    while ((match = listItemPattern.exec(sectionHtml)) !== null) {
      const text = match[1].replace(/<[^>]*>/g, '').trim();
      if (text) listItems.push(`• ${text}`);
    }
    
    // Estrai dati delle tabelle
    const tableRows: string[] = [];
    while ((match = tableRowPattern.exec(sectionHtml)) !== null) {
      const rowContent = match[1];
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = tableDataPattern.exec(rowContent)) !== null) {
        const text = cellMatch[1].replace(/<[^>]*>/g, '').trim();
        if (text) cells.push(text);
      }
      if (cells.length > 0) {
        tableRows.push(cells.join(' | '));
      }
    }
    
    // Combina tutti i contenuti estratti
    const sectionContent = [
      ...paragraphs,
      ...(listItems.length > 0 ? [listItems.join('\n')] : []),
      ...(tableRows.length > 0 ? [`Tabella: ${tableRows.join('\n')}`] : [])
    ].join('\n\n');
    
    if (sectionContent.trim()) {
      sections.push({
        title: sectionTitle,
        content: sectionContent
      });
    }
  }
  
  // Trova il titolo principale (potrebbe essere nell'h1 o nel primo tag h*)
  let mainTitle = null;
  headingPattern.lastIndex = 0;
  if ((match = headingPattern.exec(cleanedHtml)) !== null) {
    mainTitle = match[1].replace(/<[^>]*>/g, '').trim();
  }
  
  return {
    title: mainTitle,
    sections: sections
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pages } = await req.json();

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nessuna pagina fornita o formato non valido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Elaborazione di ${pages.length} elementi per la knowledge base del chatbot`);

    // Inizializza il client Supabase
    const supabaseClient = createClient(
      supabaseUrl || '',
      supabaseKey || ''
    );

    // Assicurati che il database sia configurato correttamente
    const dbSetupResult = await setupDatabase(supabaseClient);
    if (!dbSetupResult.success) {
      return new Response(
        JSON.stringify({ 
          error: dbSetupResult.error || "Impossibile configurare correttamente il database" 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pulisci la knowledge base esistente
    try {
      const { error: deleteError } = await supabaseClient
        .from('chatbot_knowledge')
        .delete()
        .is('id', 'not.null'); // Questo eliminerà tutti i record
          
      if (deleteError) {
        console.error('Errore nell\'eliminazione della knowledge base esistente:', deleteError);
        return new Response(
          JSON.stringify({ error: "Impossibile cancellare la knowledge base esistente: " + deleteError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log("Knowledge base esistente cancellata con successo");
    } catch (deleteError) {
      console.error('Errore nell\'eliminazione della knowledge base esistente:', deleteError);
      return new Response(
        JSON.stringify({ error: "Impossibile cancellare la knowledge base esistente: " + deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inserisci la nuova knowledge base con gli embedding
    console.log("Creazione di nuovi embedding e inserimento nella knowledge base");
    let successCount = 0;
    let errorCount = 0;
    let totalChunks = 0;
    
    for (const page of pages) {
      try {
        // Se il contenuto è in formato HTML, estrai contenuti strutturati
        const pageContent = page.content || "";
        let contentChunks = [];
        
        // Verifica se il contenuto sembra essere HTML
        if (pageContent.includes('<') && pageContent.includes('>')) {
          try {
            // Estrai contenuti strutturati dal HTML
            const structuredContent = extractStructuredContent(pageContent);
            
            // Aggiungi il titolo principale come chunk
            if (structuredContent.title) {
              contentChunks.push({
                type: 'main_title',
                title: page.title,
                content: `Titolo: ${structuredContent.title}`,
                keywords: extractKeywords(structuredContent.title)
              });
            }
            
            // Aggiungi ciascuna sezione come chunk separato
            structuredContent.sections.forEach((section, index) => {
              contentChunks.push({
                type: 'section_title',
                title: section.title,
                content: `Sezione: ${section.title}`,
                section_title: section.title,
                original_position: index * 10,
                keywords: extractKeywords(section.title)
              });
              
              // Per ogni sezione, dividi il contenuto in paragrafetti più piccoli
              const paragraphs = section.content.split('\n\n').filter(p => p.trim().length > 0);
              
              paragraphs.forEach((paragraph, pIndex) => {
                // Se il paragrafo è un elenco puntato, trattalo come lista
                if (paragraph.includes('•')) {
                  contentChunks.push({
                    type: 'list_item',
                    title: section.title,
                    content: paragraph,
                    section_title: section.title,
                    original_position: (index * 10) + pIndex + 1,
                    keywords: extractKeywords(paragraph)
                  });
                } else {
                  contentChunks.push({
                    type: 'paragraph',
                    title: section.title,
                    content: paragraph,
                    section_title: section.title,
                    original_position: (index * 10) + pIndex + 1,
                    keywords: extractKeywords(paragraph)
                  });
                }
              });
            });
            
            console.log(`Estratti ${contentChunks.length} frammenti strutturati dalla pagina: ${page.title}`);
          } catch (structureError) {
            console.error(`Errore nell'estrazione dei contenuti strutturati per la pagina ${page.id}:`, structureError);
            
            // Fallback a divisione semplice del testo
            const plainText = pageContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            
            // Dividi in frammenti di circa 200 parole con sovrapposizione
            const words = plainText.split(' ');
            const chunkSize = 200;
            const overlap = 50;
            
            for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
              const chunkWords = words.slice(i, i + chunkSize);
              const chunk = chunkWords.join(' ');
              if (chunk.length > 20) {  // Ignora frammenti troppo piccoli
                contentChunks.push({
                  type: 'paragraph',
                  title: page.title,
                  content: chunk,
                  original_position: i,
                  keywords: extractKeywords(chunk)
                });
              }
            }
            
            console.log(`Fallback: Generati ${contentChunks.length} frammenti di testo dalla pagina: ${page.title}`);
          }
        } else {
          // Testo semplice, dividi in frammenti
          const plainText = pageContent.trim();
          
          // Dividi in frammenti di circa 200 parole con sovrapposizione
          const words = plainText.split(' ');
          const chunkSize = 200;
          const overlap = 50;
          
          for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
            const chunkWords = words.slice(i, i + chunkSize);
            const chunk = chunkWords.join(' ');
            if (chunk.length > 20) {  // Ignora frammenti troppo piccoli
              contentChunks.push({
                type: 'paragraph',
                title: page.title,
                content: chunk,
                original_position: i,
                keywords: extractKeywords(chunk)
              });
            }
          }
          
          console.log(`Generati ${contentChunks.length} frammenti di testo dalla pagina: ${page.title}`);
        }
        
        // Aggiungi anche un frammento con il contenuto dell'intera pagina per contesto generale
        contentChunks.push({
          type: 'full_page',
          title: page.title,
          content: `Pagina completa "${page.title}": ${pageContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 8000)}`,
          original_position: 9999,
          keywords: extractKeywords(page.title + " " + pageContent.replace(/<[^>]*>/g, ' '))
        });
        
        totalChunks += contentChunks.length;
        
        // Elabora ogni chunk e crea gli embedding
        for (const chunk of contentChunks) {
          // Crea gli embedding usando OpenAI
          const embedding = await createEmbedding(chunk.content);
          
          if (embedding) {
            try {
              const { error: insertError } = await supabaseClient
                .from('chatbot_knowledge')
                .insert({
                  page_id: page.id,
                  title: page.title,
                  content: chunk.content,
                  path: page.path || "/",
                  embedding: embedding,
                  content_type: chunk.type,
                  section_title: chunk.section_title || null,
                  original_position: chunk.original_position || 0,
                  keywords: chunk.keywords
                });
                
              if (insertError) {
                console.error(`Errore nell'inserimento del frammento per la pagina ${page.id}:`, insertError);
                errorCount++;
              } else {
                successCount++;
              }
            } catch (insertError) {
              console.error(`Errore nell'inserimento del frammento per la pagina ${page.id}:`, insertError);
              errorCount++;
            }
          } else {
            console.error(`Impossibile creare l'embedding per il frammento della pagina ${page.id}`);
            errorCount++;
          }
        }
        
        console.log(`Pagina elaborata con successo: ${page.title} (${contentChunks.length} frammenti)`);
      } catch (error) {
        console.error(`Errore nell'elaborazione della pagina ${page.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Aggiornamento della knowledge base completato. Successo: ${successCount}, Errori: ${errorCount}, Frammenti totali: ${totalChunks}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Elaborati con successo ${successCount} su ${totalChunks} frammenti di contenuto per la knowledge base del chatbot`,
        total_chunks: totalChunks,
        errors: errorCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Errore nella funzione create-chatbot-knowledge:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Si è verificato un errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Funzione migliorata per creare embedding usando OpenAI
async function createEmbedding(text: string): Promise<number[] | null> {
  try {
    // Ottimizzazione: limita la dimensione del testo a 8000 caratteri per l'efficienza
    const trimmedText = text.slice(0, 8000);
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: trimmedText
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
