import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import BackToMenu from "@/components/BackToMenu";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First try to authenticate with Supabase Admin Users
      const { data, error } = await supabase.functions.invoke("admin_users_helpers", {
        body: { 
          action: "login_user", 
          email, 
          password 
        }
      });
      
      if (error) {
        console.error("Error calling admin_users_helpers:", error);
        throw error;
      }
      
      if (data && data.success) {
        // Admin user authenticated
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userType", "admin");
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        toast.success("Login amministratore effettuato con successo!");
        navigate("/admin");
        return;
      } else if (data && data.error) {
        // Specific error from the function
        toast.error(data.error);
      }
      
      // If not an admin user or if there was an error, try with demo credentials
      checkDemoCredentials();
    } catch (error) {
      console.error("Errore durante il login:", error);
      // Demo credentials fallback
      checkDemoCredentials();
    } finally {
      setIsLoading(false);
    }
  };

  const checkDemoCredentials = () => {
    if (email === "admin" && password === "password") {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userType", "admin");
      localStorage.setItem("admin_token", "demo_token");
      toast.success("Login admin effettuato con successo (modalità demo)!");
      navigate("/admin");
    } else if (email === "user" && password === "password") {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userType", "regular");
      toast.success("Login utente effettuato con successo (modalità demo)!");
      navigate("/menu");
    } else {
      toast.error("Credenziali non valide");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-6 pt-20">
      <BackToMenu />
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-emerald-700 mb-6 text-center">Accedi</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email / Username</Label>
            <Input 
              id="email" 
              type="text" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Inserisci email o username"
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci password"
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accesso in corso...
              </>
            ) : (
              "Accedi"
            )}
          </Button>
          
          <div className="text-xs text-gray-500 text-center mt-4">
            <p className="mb-1">Per demo utente: username "user" e password "password"</p>
            <p>Per demo admin: username "admin" e password "password"</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
