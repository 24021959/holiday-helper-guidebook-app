
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
              updated_at timestamp with time zone DEFAULT now()
            );
          `
        });
        console.log("Tabella chatbot_knowledge creata o già esistente");
      } catch (createTableError) {
        console.error("Errore nella creazione della tabella:", createTableError);
        return { 
          success: false, 
          error: `Impossibile creare la tabella chatbot_knowledge: ${createTableError.message || JSON.stringify(createTableError)}` 
        };
      }
      
      // Crea o aggiorna la funzione match_documents
      try {
        await client.rpc('execute_sql', {
          sql_command: `
            CREATE OR REPLACE FUNCTION public.match_documents(
              query_embedding vector(1536),
              match_threshold float,
              match_count int
            )
            RETURNS TABLE(
              id uuid,
              page_id uuid,
              title text,
              content text,
              path text,
              similarity float
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
              RETURN QUERY
              SELECT
                "chatbot_knowledge"."id",
                "chatbot_knowledge"."page_id",
                "chatbot_knowledge"."title",
                "chatbot_knowledge"."content",
                "chatbot_knowledge"."path",
                1 - ("chatbot_knowledge"."embedding" <=> query_embedding) AS "similarity"
              FROM
                "chatbot_knowledge"
              WHERE
                1 - ("chatbot_knowledge"."embedding" <=> query_embedding) > match_threshold
              ORDER BY
                "chatbot_knowledge"."embedding" <=> query_embedding
              LIMIT
                match_count;
            END;
            $$;
          `
        });
        console.log("Funzione match_documents creata o aggiornata con successo");
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
    
    for (const page of pages) {
      try {
        // Pulisci e prepara il contenuto
        const cleanContent = page.content.replace(/\s+/g, ' ').trim();
        
        // Crea gli embedding usando OpenAI
        const embedding = await createEmbedding(cleanContent);
        
        if (embedding) {
          try {
            const { error: insertError } = await supabaseClient
              .from('chatbot_knowledge')
              .insert({
                page_id: page.id,
                title: page.title,
                content: cleanContent,
                path: page.path,
                embedding: embedding
              });
              
            if (insertError) {
              console.error(`Errore nell'inserimento della pagina ${page.id}:`, insertError);
              errorCount++;
            } else {
              successCount++;
              console.log(`Pagina elaborata con successo: ${page.title}`);
            }
          } catch (insertError) {
            console.error(`Errore nell'inserimento della pagina ${page.id}:`, insertError);
            errorCount++;
          }
        } else {
          console.error(`Impossibile creare l'embedding per la pagina ${page.id}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Errore nell'elaborazione della pagina ${page.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Aggiornamento della knowledge base completato. Successo: ${successCount}, Errori: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Elaborati con successo ${successCount} su ${pages.length} elementi per la knowledge base del chatbot`,
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
