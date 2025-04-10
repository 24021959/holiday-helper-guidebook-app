
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    
    if (!page || !page.id) {
      return new Response(
        JSON.stringify({ error: 'No valid page data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing page ${page.id}: ${page.title}`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl || '', supabaseKey || '');
    
    // Clean HTML and format content
    const cleanContent = (page.content || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/<!--.*?-->/g, "")
      .replace(/\s+/g, " ")
      .trim();
    
    // Format any list items if present
    let listItemsText = "";
    if (page.list_items && Array.isArray(page.list_items) && page.list_items.length > 0) {
      listItemsText = "\n\nItems in this page:\n" + 
        page.list_items.map((item: any, index: number) => 
          `${index + 1}. ${item.name || ""} - ${item.description || ""}`
        ).join("\n");
    }
    
    // Create formatted content
    let formattedContent = "";
    
    if (openAIApiKey) {
      try {
        // Use OpenAI to extract and format the content in a structured way
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: `You are a content extractor. Your task is to extract relevant information from website content 
                and format it in a clear, structured markdown format that will be used by a chatbot to answer questions.
                Focus on extracting factual information that would be useful for answering user questions. 
                Include details about services, locations, pricing, schedules, policies, and descriptions.
                Format with clear headings and bullet points when appropriate.` 
              },
              { 
                role: 'user', 
                content: `
                Page Title: ${page.title || "Untitled"}
                URL Path: ${page.path || ""}
                Raw Content: ${cleanContent}
                ${listItemsText}
                
                Please extract and format the key information from this content in clear, structured markdown.
                `
              }
            ],
            temperature: 0.3,
          }),
        });
    
        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        formattedContent = data.choices[0].message.content;
      } catch (openAIError) {
        console.error("OpenAI processing error:", openAIError);
        // Fall back to manual formatting if OpenAI fails
        formattedContent = `
# ${page.title || "Untitled"}
URL: ${page.path || ""}

${cleanContent}
${listItemsText}
        `.trim();
      }
    } else {
      // No OpenAI key available, use manual formatting
      formattedContent = `
# ${page.title || "Untitled"}
URL: ${page.path || ""}

${cleanContent}
${listItemsText}
      `.trim();
    }
    
    // Store the processed content in the database
    try {
      const { error } = await supabase
        .from('chatbot_knowledge')
        .upsert({
          page_id: page.id,
          title: page.title || "Untitled",
          content: formattedContent,
          path: page.path || "",
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_id'
        });
        
      if (error) {
        throw error;
      }
      
      console.log(`Successfully processed and stored page ${page.id}`);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Content processed and stored successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error in process-page-content function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
