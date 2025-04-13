
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, User, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login: React.FC = () => {
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [masterUsername, setMasterUsername] = useState<string>("");
  const [masterPassword, setMasterPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("admin");
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const navigate = useNavigate();

  // Verifica se l'utente è già autenticato
  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      if (isAuthenticated) {
        navigate("/admin");
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Verifica la connessione al database
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log("Verifica della connessione al database...");
        const { error } = await supabase.from('header_settings').select('count').limit(1);
        
        if (error) {
          console.error("Errore nel controllo della connessione a Supabase:", error);
          toast.info("Modalità demo attiva.", {
            duration: 5000,
            id: "demo-mode-info"
          });
          setDemoMode(true);
        } else {
          console.log("Connessione al database riuscita");
          setDemoMode(false);
        }
      } catch (err) {
        console.error("Errore di connessione a Supabase:", err);
        toast.info("Modalità demo attiva.", {
          duration: 5000,
          id: "demo-mode-info"
        });
        setDemoMode(true);
      }
    };
    
    checkConnection();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In modalità demo, accetta credenziali fisse
      if (demoMode || (adminUsername === "admin" && adminPassword === "password")) {
        localStorage.setItem("admin_token", "demo_token");
        localStorage.setItem("admin_user", adminUsername);
        localStorage.setItem("user_role", "admin");
        localStorage.setItem("isAuthenticated", "true");
        
        toast.success("Login effettuato con successo (modalità demo)");
        navigate("/admin");
        return;
      }
      
      // Altrimenti, verifica tramite Supabase
      try {
        const { data, error } = await supabase.functions.invoke("admin_users_helpers", {
          body: { 
            action: "check_login",
            email: adminUsername,
            password_hash: adminPassword
          }
        });

        if (error) {
          console.error("Errore durante la verifica del login:", error);
          toast.error("Errore durante il login. Riprova più tardi.");
          return;
        }
        
        if (data && data.success) {
          localStorage.setItem("admin_token", "user_token");
          localStorage.setItem("admin_user", adminUsername);
          localStorage.setItem("user_role", data.user.role || "admin");
          localStorage.setItem("isAuthenticated", "true");
          
          toast.success("Login effettuato con successo");
          navigate("/admin");
        } else {
          toast.error("Credenziali non valide");
        }
      } catch (err) {
        console.error("Errore durante l'invocazione della funzione:", err);
        toast.error("Errore durante il login. Riprova più tardi.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In modalità demo, accetta credenziali fisse
      if (demoMode || (masterUsername === "master" && masterPassword === "master123")) {
        localStorage.setItem("admin_token", "master_token");
        localStorage.setItem("admin_user", masterUsername);
        localStorage.setItem("user_role", "master");
        localStorage.setItem("isAuthenticated", "true");
        
        toast.success("Login Master effettuato con successo (modalità demo)");
        navigate("/admin");
        return;
      }
      
      // Altrimenti, verifica tramite Supabase (adattare secondo le tue esigenze)
      toast.error("Credenziali Master non valide");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/f82196b0-12a4-4b65-983d-804add60b9fb.png" 
            alt="Locanda dell'Angelo Logo" 
            className="h-16 mx-auto mb-4" 
          />
          <h1 className="text-2xl font-bold text-emerald-700">Locanda dell'Angelo</h1>
          <p className="text-gray-600">Accedi alla piattaforma</p>
        </div>
        
        {demoMode && (
          <Alert variant="info" className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertTitle>Modalità Demo</AlertTitle>
            <AlertDescription>
              Connessione al database non disponibile. Utilizzando la modalità demo.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger 
              value="admin" 
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              Amministratore
            </TabsTrigger>
            <TabsTrigger 
              value="master" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              Master
            </TabsTrigger>
          </TabsList>
            
          <TabsContent value="admin">
            <Card>
              <CardHeader className="bg-emerald-50 border-b border-emerald-100">
                <CardTitle className="text-emerald-700">Accesso Amministratore</CardTitle>
                <CardDescription>
                  Accedi come amministratore per gestire i contenuti
                </CardDescription>
              </CardHeader>
                
              <CardContent className="pt-6">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username
                    </Label>
                    <Input 
                      id="admin-username"
                      type="text"
                      placeholder="admin"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      disabled={isLoading}
                      className="border-emerald-200"
                      required
                    />
                  </div>
                    
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input 
                      id="admin-password"
                      type="password"
                      placeholder="••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      disabled={isLoading}
                      className="border-emerald-200"
                      required
                    />
                  </div>
                    
                  <Button 
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accesso in corso...
                      </>
                    ) : "Accedi"}
                  </Button>
                </form>
              </CardContent>
                
              <CardFooter className="flex justify-center border-t border-emerald-100 bg-emerald-50 py-3">
                <p className="text-xs text-gray-500">
                  Demo: usa username "admin" e password "password"
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
            
          <TabsContent value="master">
            <Card>
              <CardHeader className="bg-purple-50 border-b border-purple-100">
                <CardTitle className="text-purple-700">Accesso Master</CardTitle>
                <CardDescription>
                  Accedi come Master per amministrare il sistema
                </CardDescription>
              </CardHeader>
                
              <CardContent className="pt-6">
                <form onSubmit={handleMasterLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="master-username" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username Master
                    </Label>
                    <Input 
                      id="master-username"
                      type="text"
                      placeholder="master"
                      value={masterUsername}
                      onChange={(e) => setMasterUsername(e.target.value)}
                      disabled={isLoading}
                      className="border-purple-200"
                      required
                    />
                  </div>
                    
                  <div className="space-y-2">
                    <Label htmlFor="master-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password Master
                    </Label>
                    <Input 
                      id="master-password"
                      type="password"
                      placeholder="••••••"
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      disabled={isLoading}
                      className="border-purple-200"
                      required
                    />
                  </div>
                    
                  <Button 
                    type="submit"
                    className="w-full bg-purple-500 hover:bg-purple-600"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accesso in corso...
                      </>
                    ) : "Accedi come Master"}
                  </Button>
                </form>
              </CardContent>
                
              <CardFooter className="flex justify-center border-t border-purple-100 bg-purple-50 py-3">
                <p className="text-xs text-gray-500">
                  Demo: usa username "master" e password "master123"
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
