
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
    const requestData = await req.json();
    const { text, targetLang, bulkTranslation } = requestData;
    
    console.log(`Translation request received for ${targetLang}`);
    console.log(`Is bulk translation: ${!!bulkTranslation}`);
    
    if ((!text && !bulkTranslation) || !targetLang) {
      console.error("Missing required parameters");
      return new Response(
        JSON.stringify({ error: 'Text/content and target language are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if this is a bulk translation or single text
    if (bulkTranslation && Array.isArray(bulkTranslation)) {
      // Handle bulk translation of multiple texts
      console.log(`Processing bulk translation request with ${bulkTranslation.length} items to ${targetLang}`);
      
      // Filter out empty strings to prevent unnecessary translations
      const validTexts = bulkTranslation.filter(item => item && item.trim() !== '');
      
      if (validTexts.length === 0) {
        console.log("No valid texts to translate");
        return new Response(
          JSON.stringify({ translatedTexts: bulkTranslation }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Instruction for the model to translate a batch of texts
      const systemPrompt = `You are a professional translator specializing in translating web content.
      Translate each of the following texts from Italian to ${targetLang} accurately.
      Maintain the original formatting, including any HTML tags.
      Ensure the translation sounds natural and is appropriate for web context.
      DO NOT include any explanations or notes.
      Respond with a JSON array of translated texts in the same order as the input.`;
      
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
            { role: 'user', content: JSON.stringify(validTexts) }
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
        console.log(`Response received: ${content.substring(0, 100)}...`);
        
        const parsedContent = JSON.parse(content);
        
        if (Array.isArray(parsedContent.translations)) {
          console.log(`Successfully parsed ${parsedContent.translations.length} translations`);
          
          // Map back to original array structure, preserving empty items
          const resultTranslations = bulkTranslation.map((item, index) => {
            if (!item || item.trim() === '') {
              return item; // Keep empty items as is
            }
            return parsedContent.translations[validTexts.indexOf(item)] || item;
          });
          
          return new Response(
            JSON.stringify({ translatedTexts: resultTranslations }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          console.error("Invalid response format, 'translations' array not found");
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
      // Handle single text translation
      if (!text || text.trim() === '') {
        return new Response(
          JSON.stringify({ translatedText: text }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Processing single text translation to ${targetLang}: "${text.substring(0, 30)}..."`);
      
      // Specific instructions for the translation model
      const systemPrompt = `You are a professional translator.
      Translate the following text from Italian to ${targetLang}.
      Do not add any explanations or comments.
      Preserve all HTML formatting and tags exactly as they appear in the original.
      Preserve all markdown formatting exactly as it appears in the original.
      Ensure the translation sounds natural in ${targetLang}.
      Never change or remove HTML tags or attributes, keep them intact.
      If proper names or specific terms should not be translated, keep them as they are.`;
      
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
      console.log(`Translation successful: "${translatedText.substring(0, 30)}..."`);

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
