
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
    const { page } = await req.json();

    if (!page) {
      return new Response(
        JSON.stringify({ error: 'No page provided or invalid format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing page: ${page.title} (${page.id})`);

    // Initialize Supabase client
    const supabaseClient = createClient(
      supabaseUrl || '',
      supabaseKey || ''
    );

    // Clean HTML tags and format content
    const cleanContent = (page.content || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/<!--.*?-->/g, "")
      .replace(/\s+/g, " ")
      .trim();
    
    // Extract list items if present
    let listItemsText = "";
    if (page.list_items && Array.isArray(page.list_items) && page.list_items.length > 0) {
      listItemsText = "\n\nItems in this page:\n" + 
        page.list_items.map((item, index) => 
          `${index + 1}. ${item.name || ""} - ${item.description || ""}`
        ).join("\n");
    }

    // Format the content in a way that's useful for the chatbot
    let formattedContent = `
Page Title: ${page.title || "Untitled"}
URL Path: ${page.path || ""}
Content: ${cleanContent}${listItemsText}
    `.trim();

    // Use OpenAI to summarize and extract key points (if API key available)
    if (openAIApiKey) {
      try {
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that summarizes webpage content and extracts key information for a chatbot knowledge base. Format the information in a clear, structured way that will be useful for a chatbot to retrieve relevant information when answering user questions.'
              },
              {
                role: 'user',
                content: `Please summarize and extract key information from this page content, organize it in a way that's useful for a chatbot knowledge base:\n\n${formattedContent}`
              }
            ],
            temperature: 0.3,
            max_tokens: 1000,
          }),
        });

        if (openAIResponse.ok) {
          const data = await openAIResponse.json();
          if (data.choices && data.choices[0] && data.choices[0].message) {
            // Replace the formatted content with the AI-processed version
            formattedContent = data.choices[0].message.content;
            console.log("Content successfully processed by AI");
          }
        } else {
          console.error("Error from OpenAI:", await openAIResponse.text());
        }
      } catch (openAIError) {
        console.error("Error using OpenAI for content processing:", openAIError);
        // Continue with the original formatted content
      }
    }

    // Create the knowledge base table if it doesn't exist
    try {
      const { error: tableError } = await supabaseClient.rpc('run_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            page_id uuid NOT NULL,
            title text NOT NULL,
            content text NOT NULL, 
            path text NOT NULL,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
          );
        `
      });
      
      if (tableError) {
        console.error("Error creating table:", tableError);
      }
    } catch (tableError) {
      console.error("Error creating table:", tableError);
    }

    // Save to database
    const { data, error } = await supabaseClient
      .from('chatbot_knowledge')
      .upsert({
        page_id: page.id,
        title: page.title || "Untitled",
        content: formattedContent,
        path: page.path || "",
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'page_id'
      })
      .select();

    if (error) {
      console.error("Error storing processed content:", error);
      
      // Attempt a more direct, simpler insert as fallback
      try {
        const { error: fallbackError } = await supabaseClient.rpc('run_sql', {
          sql: `
            INSERT INTO public.chatbot_knowledge (page_id, title, content, path)
            VALUES ('${page.id}', '${(page.title || "Untitled").replace(/'/g, "''")}', '${formattedContent.substring(0, 500).replace(/'/g, "''")}...', '${(page.path || "").replace(/'/g, "''")}')
            ON CONFLICT (page_id) DO UPDATE
            SET content = EXCLUDED.content, title = EXCLUDED.title, path = EXCLUDED.path, updated_at = now();
          `
        });
        
        if (fallbackError) {
          throw fallbackError;
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Contenuto salvato con metodo alternativo"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contenuto elaborato e salvato con successo",
        data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-page-content function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Errore durante l'elaborazione del contenuto della pagina"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
