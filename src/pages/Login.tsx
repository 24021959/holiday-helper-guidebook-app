
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import BackToMenu from "@/components/BackToMenu";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login: React.FC = () => {
  // User login state
  const [userUsername, setUserUsername] = useState<string>("");
  const [userPassword, setUserPassword] = useState<string>("");
  const [isUserLoading, setIsUserLoading] = useState<boolean>(false);
  
  // Admin login state
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [isAdminLoading, setIsAdminLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUserLoading(true);
    
    try {
      console.log("Tentativo di login utente con:", userUsername, userPassword);
      
      // User demo login is simplified - only username "user" and password "password"
      if (userUsername.toLowerCase() === "user" && userPassword === "password") {
        console.log("Credenziali utente demo valide!");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userType", "regular");
        toast.success("Login utente effettuato con successo!");
        navigate("/admin");
      } else {
        console.log("Credenziali utente demo non valide");
        toast.error("Credenziali utente non valide");
      }
    } catch (error) {
      console.error("Errore durante il login utente:", error);
      toast.error("Errore durante il login. Riprova più tardi.");
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminLoading(true);
    
    try {
      console.log("Tentativo di login admin con:", adminEmail, adminPassword);
      
      // Admin demo credentials check
      if (adminEmail.toLowerCase() === "admin" && adminPassword === "password") {
        console.log("Credenziali admin demo valide!");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userType", "admin");
        localStorage.setItem("admin_token", "demo_token");
        toast.success("Login admin effettuato con successo!");
        navigate("/menu");
        return;
      }
      
      console.log("Credenziali admin demo non valide, provo con Supabase");
      
      // Try Supabase admin users helper
      const { data, error } = await supabase.functions.invoke("admin_users_helpers", {
        body: { 
          action: "login_user", 
          email: adminEmail, 
          password: adminPassword 
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
        
        navigate("/menu");
      } else {
        toast.error("Credenziali admin non valide");
      }
    } catch (error) {
      console.error("Errore durante il login admin:", error);
      toast.error("Errore durante il login. Riprova più tardi.");
    } finally {
      setIsAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-6 pt-20">
      <BackToMenu />
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-emerald-700 mb-6 text-center">Accesso</h1>
        
        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="user" className="flex items-center justify-center gap-2">
              <User size={16} />
              <span>Utente</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center justify-center gap-2">
              <Settings size={16} />
              <span>Amministratore</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="user">
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  type="text" 
                  value={userUsername} 
                  onChange={(e) => setUserUsername(e.target.value)}
                  placeholder="Inserisci username"
                  className="mt-1"
                  disabled={isUserLoading}
                />
              </div>
              <div>
                <Label htmlFor="userPassword">Password</Label>
                <Input 
                  id="userPassword" 
                  type="password" 
                  value={userPassword} 
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Inserisci password"
                  className="mt-1"
                  disabled={isUserLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isUserLoading}>
                {isUserLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  "Accedi come Utente"
                )}
              </Button>
              
              <div className="text-xs text-gray-500 text-center mt-4">
                <p>Per demo utente: username "user" e password "password"</p>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="admin">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label htmlFor="adminEmail">Email / Username</Label>
                <Input 
                  id="adminEmail" 
                  type="text" 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Inserisci email o username"
                  className="mt-1"
                  disabled={isAdminLoading}
                />
              </div>
              <div>
                <Label htmlFor="adminPassword">Password</Label>
                <Input 
                  id="adminPassword" 
                  type="password" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Inserisci password"
                  className="mt-1"
                  disabled={isAdminLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isAdminLoading}>
                {isAdminLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  "Accedi come Admin"
                )}
              </Button>
              
              <div className="text-xs text-gray-500 text-center mt-4">
                <p>Per demo admin: username "admin" e password "password"</p>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
