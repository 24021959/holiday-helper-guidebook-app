import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const htmlToPlainText = (html) => {
  try {
    if (!html) return "";
    
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    
    const scriptsAndStyles = doc.querySelectorAll("script, style, [hidden], .hidden, meta, link, head");
    scriptsAndStyles.forEach(el => el.remove());
    
    let text = doc.textContent || html;
    
    text = text.replace(/\s+/g, " ").trim();
    
    return text;
  } catch (e) {
    console.error("Error parsing HTML:", e);
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
};

const extractStructuredContent = (page) => {
  try {
    let structuredContent = `Titolo: ${page.title || "Senza titolo"}\n`;
    structuredContent += `URL: ${page.path || ""}\n\n`;
    
    let mainContent = "";
    if (page.content) {
      mainContent = htmlToPlainText(page.content);
      if (mainContent.length > 8000) {
        mainContent = mainContent.substring(0, 8000) + "... (contenuto troncato)";
      }
    }
    
    structuredContent += `Contenuto principale:\n${mainContent}\n\n`;
    
    if (page.list_items && Array.isArray(page.list_items) && page.list_items.length > 0) {
      structuredContent += "Elementi della lista:\n";
      
      const limitedItems = page.list_items.slice(0, 10);
      
      limitedItems.forEach((item, index) => {
        structuredContent += `${index + 1}. `;
        
        if (item.name) structuredContent += `${item.name}`;
        if (item.name && item.description) structuredContent += " - ";
        if (item.description) {
          const desc = item.description.length > 200 
            ? item.description.substring(0, 200) + "..."
            : item.description;
          structuredContent += desc;
        }
        
        structuredContent += "\n";
        
        if (item.price) structuredContent += `   Prezzo: ${item.price}\n`;
      });
      
      if (page.list_items.length > 10) {
        structuredContent += `... e altri ${page.list_items.length - 10} elementi\n`;
      }
    }
    
    return structuredContent.trim();
  } catch (error) {
    console.error("Error extracting structured content:", error);
    return `Titolo: ${page.title || "Senza titolo"}\nURL: ${page.path || ""}\n`;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { page } = await req.json();
    
    if (!page || !page.id) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid page data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Processing page: ${page.id} - ${page.title}`);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
      await supabase.rpc("run_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            page_id uuid NOT NULL,
            title text NOT NULL,
            content text NOT NULL,
            path text NOT NULL,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
          )
        `
      });
    } catch (tableError) {
      console.error("Error ensuring table exists (continuing anyway):", tableError);
    }
    
    const structuredContent = extractStructuredContent(page);
    
    console.log(`Structured content length: ${structuredContent.length} chars`);
    
    try {
      const { error: deleteError } = await supabase
        .from("chatbot_knowledge")
        .delete()
        .eq("page_id", page.id);
      
      if (deleteError) {
        console.error("Error deleting existing entry:", deleteError);
      }
    } catch (deleteError) {
      console.error("Exception during delete:", deleteError);
    }
    
    const { data, error } = await supabase
      .from("chatbot_knowledge")
      .insert({
        page_id: page.id,
        title: page.title || "Senza titolo",
        content: structuredContent,
        path: page.path || ""
      });
    
    if (error) {
      console.error("Error inserting knowledge:", error);
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Content processed successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in process-page-content function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process page content", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
