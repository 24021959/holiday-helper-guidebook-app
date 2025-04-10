
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
    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl || '', supabaseKey || '');
    
    // Get records without embeddings
    const { data: records, error: fetchError } = await supabaseClient
      .from('chatbot_knowledge')
      .select('id, content')
      .is('embedding', null)
      .limit(50);  // Process in smaller batches
    
    if (fetchError) {
      console.error("Error fetching records:", fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!records || records.length === 0) {
      return new Response(
        JSON.stringify({ message: "No records found requiring embeddings" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing ${records.length} records for embeddings`);
    
    // Process each record
    let successCount = 0;
    let errorCount = 0;
    
    for (const record of records) {
      try {
        // Create embedding if we have an OpenAI API key
        if (openAIApiKey) {
          const embedding = await createEmbedding(record.content);
          
          if (embedding) {
            // Update the record with the embedding
            const { error: updateError } = await supabaseClient
              .from('chatbot_knowledge')
              .update({ embedding: embedding })
              .eq('id', record.id);
              
            if (updateError) {
              console.error(`Error updating record ${record.id}:`, updateError);
              errorCount++;
            } else {
              successCount++;
            }
          } else {
            console.warn(`Could not create embedding for record ${record.id}`);
            errorCount++;
          }
        } else {
          console.warn("OpenAI API key not configured, skipping embedding creation");
          break; // No point in continuing without an API key
        }
      } catch (recordError) {
        console.error(`Error processing record ${record.id}:`, recordError);
        errorCount++;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: successCount > 0,
        processed: records.length,
        successful: successCount,
        failed: errorCount,
        message: `Processed ${records.length} records, ${successCount} successful, ${errorCount} failed`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to create embeddings
async function createEmbedding(text: string): Promise<number[] | null> {
  try {
    if (!openAIApiKey) {
      console.warn("OpenAI API key is not configured");
      return null;
    }
    
    console.log("Requesting embedding from OpenAI");
    
    // Limit text length to avoid token limits
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API response error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      console.error('Unexpected response format from OpenAI:', data);
      return null;
    }
    
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    return null;
  }
}
