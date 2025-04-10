
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
    
    // Extract content using a specialized HTML processing approach
    const extractedContent = extractContentFromHtml(page.content || "");
    
    // Format any list items if present
    let listItemsText = "";
    if (page.list_items && Array.isArray(page.list_items) && page.list_items.length > 0) {
      listItemsText = "\n\nItems in this page:\n" + 
        page.list_items.map((item: any, index: number) => 
          `${index + 1}. ${item.name || ""} - ${item.description || ""}`
        ).join("\n");
    }
    
    // Create a well-structured content format
    const formattedContent = `
# ${page.title || "Untitled"}
URL Path: ${page.path || ""}

${extractedContent}
${listItemsText}
    `.trim();
    
    // If OpenAI API key is available, use it for enhanced content processing
    let finalContent = formattedContent;
    
    if (openAIApiKey) {
      try {
        console.log("Using OpenAI to enhance content structure");
        
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: `You are a content extractor specialized in hospitality information. 
                Your task is to extract and structure information from hotel and accommodation websites.
                Focus on capturing details about:
                - Room amenities and types
                - Services offered (restaurant, spa, etc.)
                - Location details and transportation
                - Check-in/check-out policies
                - Pricing information
                - Special features or highlights
                
                Structure the content clearly with headings, bullet points, and organized sections.
                Remove any marketing fluff and focus on factual information.`
              },
              { 
                role: 'user', 
                content: `Extract and structure the key information from this hotel page content. Make it clear and organized:
                
                Title: ${page.title || "Untitled"}
                URL: ${page.path || ""}
                Content: ${formattedContent}`
              }
            ],
            temperature: 0.2,
          }),
        });
        
        if (!aiResponse.ok) {
          throw new Error(`OpenAI API error: ${aiResponse.statusText}`);
        }
        
        const aiData = await aiResponse.json();
        finalContent = aiData.choices[0].message.content;
        console.log("Content enhanced with AI successfully");
      } catch (aiError) {
        console.error("Error using OpenAI for content enhancement:", aiError);
        // If AI processing fails, use the original formatted content
      }
    }
    
    // Store the processed content in the database
    try {
      console.log(`Storing processed content for page ${page.id}`);
      
      const { error } = await supabase
        .from('chatbot_knowledge')
        .upsert({
          page_id: page.id,
          title: page.title || "Untitled",
          content: finalContent,
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
        JSON.stringify({ 
          success: true, 
          message: 'Content processed and stored successfully',
          content: finalContent.substring(0, 500) + '...' // Return preview of processed content
        }),
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

// Specialized function to extract content from HTML with better handling of structures
function extractContentFromHtml(htmlContent: string): string {
  if (!htmlContent) return "";
  
  // First, basic HTML stripping
  let text = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ") // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")    // Remove styles
    .replace(/<!--[\s\S]*?-->/g, " ")                                    // Remove comments
    .replace(/<[^>]+>/g, " ");                                           // Remove tags
  
  // Normalize whitespace
  text = text.replace(/\s+/g, " ").trim();
  
  // Try to identify and preserve structural elements
  // This is a simplified approach - in reality you might use a DOM parser
  
  // Extract headings from original HTML
  const headings: string[] = [];
  const headingRegex = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  let headingMatch;
  
  while ((headingMatch = headingRegex.exec(htmlContent)) !== null) {
    const headingText = headingMatch[1].replace(/<[^>]+>/g, "").trim();
    if (headingText) {
      headings.push(headingText);
    }
  }
  
  // Extract list items
  const listItems: string[] = [];
  const listItemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let listItemMatch;
  
  while ((listItemMatch = listItemRegex.exec(htmlContent)) !== null) {
    const itemText = listItemMatch[1].replace(/<[^>]+>/g, "").trim();
    if (itemText) {
      listItems.push(`- ${itemText}`);
    }
  }
  
  // Build the structured content
  let structuredContent = text;
  
  if (headings.length > 0) {
    structuredContent += "\n\n### Key Information\n" + headings.map(h => `- ${h}`).join("\n");
  }
  
  if (listItems.length > 0) {
    structuredContent += "\n\n### Details\n" + listItems.join("\n");
  }
  
  return structuredContent;
}
