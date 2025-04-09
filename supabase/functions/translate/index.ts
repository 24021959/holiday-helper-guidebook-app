
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { text, targetLang, bulkTranslation } = await req.json();
    
    if ((!text && !bulkTranslation) || !targetLang) {
      return new Response(
        JSON.stringify({ error: 'Text/content and target language are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if this is a bulk translation or single text
    if (bulkTranslation && Array.isArray(bulkTranslation)) {
      // Handle bulk translation of multiple texts
      console.log(`Processing bulk translation request with ${bulkTranslation.length} items to ${targetLang}`);
      
      // Instruction for the model to translate a batch of texts
      const systemPrompt = `Sei un traduttore professionale specializzato nella traduzione di contenuti web.
      Traduci accuratamente ciascuno dei seguenti testi dall'italiano a ${targetLang}.
      Mantieni la formattazione originale, inclusi eventuali tag HTML.
      Assicurati che la traduzione suoni naturale e sia adatta al contesto web.
      Rispondi con un array JSON di testi tradotti nello stesso ordine dell'input.`;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(bulkTranslation) }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('OpenAI API error:', data.error);
        return new Response(
          JSON.stringify({ error: data.error.message || 'Error from OpenAI API' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const content = data.choices[0].message.content;
        const parsedContent = JSON.parse(content);
        
        if (Array.isArray(parsedContent.translations)) {
          return new Response(
            JSON.stringify({ translatedTexts: parsedContent.translations }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          throw new Error('Invalid response format from translation');
        }
      } catch (parseError) {
        console.error('Error parsing translation response:', parseError);
        return new Response(
          JSON.stringify({ error: 'Failed to parse translation response' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Handle single text translation (original functionality)
      // Instruction for the model to translate
      const systemPrompt = `Sei un traduttore professionale. Traduci il seguente testo dall'italiano a ${targetLang}. 
      Rispondi solo con la traduzione, nient'altro. Assicurati che la traduzione suoni naturale e sia adatta al contesto.`;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('OpenAI API error:', data.error);
        return new Response(
          JSON.stringify({ error: data.error.message || 'Error from OpenAI API' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const translatedText = data.choices[0].message.content.trim();

      return new Response(
        JSON.stringify({ translatedText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in translate function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
