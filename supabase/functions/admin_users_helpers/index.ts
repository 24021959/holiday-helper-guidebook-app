
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Secret per firmare i JWT (in produzione usare un valore da Secrets)
const JWT_SECRET = new TextEncoder().encode(
  Deno.env.get("JWT_SECRET") || "your-256-bit-secret"
);

// Genera un JWT token per l'utente
async function generateToken(userId: string, email: string, role: string) {
  const payload = {
    id: userId,
    email,
    role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 ore
  };
  
  return await create({ alg: "HS256", typ: "JWT" }, payload, JWT_SECRET);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create a Supabase client with the auth context of the logged-in user
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const body = await req.json();
    
    // Handle get users RPC
    if (body.action === "get_users") {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Handle login user
    if (body.action === "login_user") {
      const { email, password } = body;
      
      // Verifica se l'utente esiste
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "Utente non trovato o disattivato" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      
      // Verifica password (in un ambiente di produzione si userebbe bcrypt)
      if (data.password_hash !== password) {
        return new Response(JSON.stringify({ error: "Password non valida" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      
      // Genera token JWT
      const token = await generateToken(data.id, data.email, data.role);
      
      const user = {
        id: data.id,
        email: data.email,
        role: data.role,
      };
      
      return new Response(JSON.stringify({ success: true, token, user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Handle create user
    if (body.action === "create_user") {
      const { email, password_hash, role } = body;
      
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          email,
          password_hash, 
          role,
          is_active: true
        })
        .select();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Handle toggle user status
    if (body.action === "toggle_status") {
      const { id, is_active } = body;
      
      const { data, error } = await supabase
        .from('admin_users')
        .update({ is_active })
        .eq('id', id)
        .select();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Handle delete user
    if (body.action === "delete_user") {
      const { id } = body;
      
      const { data, error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify({ error: "Azione non riconosciuta" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
    
  } catch (error) {
    console.error("Errore nell'elaborazione della richiesta:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
