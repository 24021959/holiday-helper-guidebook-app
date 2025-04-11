
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { md5 } from "js-md5";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";

const Login: React.FC = () => {
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [masterUsername, setMasterUsername] = useState<string>("");
  const [masterPassword, setMasterPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("admin");
  const [configError, setConfigError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConfigError(false);
        const { error } = await supabase.from('header_settings').select('count').single();
        if (error && error.code === '42P01') {
          console.log("Table does not exist, but connection works");
          setConfigError(false);
        } else if (error) {
          console.error("Error checking Supabase connection:", error);
          setConfigError(true);
        } else {
          setConfigError(false);
        }
      } catch (err) {
        console.error("Error connecting to Supabase:", err);
        setConfigError(true);
      }
    };
    
    checkConnection();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (adminUsername === "admin" && adminPassword === "password") {
        // Demo login
        localStorage.setItem("admin_token", "demo_token");
        localStorage.setItem("admin_user", "admin");
        localStorage.setItem("isAuthenticated", "true");
        toast.success("Login effettuato con successo (modalità demo)");
        navigate("/admin");
        return;
      } 
      
      const success = await checkDbLogin(adminUsername, adminPassword, "user");
      if (!success) {
        toast.error("Credenziali non valide");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Errore durante il login. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (masterUsername === "master" && masterPassword === "master123") {
        localStorage.setItem("admin_token", "master_token");
        localStorage.setItem("admin_user", "master");
        localStorage.setItem("user_role", "master");
        localStorage.setItem("isAuthenticated", "true");
        toast.success("Login come Master effettuato con successo");
        navigate("/admin?tab=user-management");
        return;
      }
      
      // Check DB login if not using demo credentials
      const success = await checkDbLogin(masterUsername, masterPassword, "master");
      if (!success) {
        toast.error("Credenziali Master non valide");
      }
    } catch (error) {
      console.error("Master login error:", error);
      toast.error("Errore durante il login. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkDbLogin = async (email: string, password: string, role: string): Promise<boolean> => {
    try {
      console.log("Checking DB login for:", email);
      
      // Try to call the Edge Function
      try {
        const { data, error } = await supabase.functions.invoke("admin_users_helpers", {
          body: { 
            action: "check_login",
            email,
            password_hash: md5(password)
          }
        });

        console.log("Login check response:", data, error);

        if (error) {
          console.error("Error checking login:", error);
          // Fall back to demo login if function call fails
          if (email === "admin" && password === "password") {
            localStorage.setItem("admin_token", "demo_token");
            localStorage.setItem("admin_user", "admin");
            localStorage.setItem("isAuthenticated", "true");
            toast.success("Login effettuato con successo (modalità demo)");
            navigate("/admin");
            return true;
          }
          return false;
        }
        
        if (data && data.success) {
          localStorage.setItem("admin_token", "user_token");
          localStorage.setItem("admin_user", email);
          localStorage.setItem("user_role", role);
          localStorage.setItem("isAuthenticated", "true");
          toast.success("Login effettuato con successo");
          navigate("/admin");
          return true;
        }
        
        return false;
      } catch (error) {
        console.error("Error invoking function:", error);
        
        // Fall back to demo login
        if (email === "admin" && password === "password") {
          localStorage.setItem("admin_token", "demo_token");
          localStorage.setItem("admin_user", "admin");
          localStorage.setItem("isAuthenticated", "true");
          toast.success("Login effettuato con successo (modalità demo)");
          navigate("/admin");
          return true;
        }
        
        if (email === "master" && password === "master123" && role === "master") {
          localStorage.setItem("admin_token", "master_token");
          localStorage.setItem("admin_user", "master");
          localStorage.setItem("user_role", "master");
          localStorage.setItem("isAuthenticated", "true");
          toast.success("Login come Master effettuato con successo");
          navigate("/admin?tab=user-management");
          return true;
        }
        
        return false;
      }
    } catch (error) {
      console.error("Login check error:", error);
      
      // Final fallback for demo login
      if (email === "admin" && password === "password") {
        localStorage.setItem("admin_token", "demo_token");
        localStorage.setItem("admin_user", "admin");
        localStorage.setItem("isAuthenticated", "true");
        toast.success("Login effettuato con successo (modalità demo)");
        navigate("/admin");
        return true;
      }
      
      if (email === "master" && password === "master123" && role === "master") {
        localStorage.setItem("admin_token", "master_token");
        localStorage.setItem("admin_user", "master");
        localStorage.setItem("user_role", "master");
        localStorage.setItem("isAuthenticated", "true");
        toast.success("Login come Master effettuato con successo");
        navigate("/admin?tab=user-management");
        return true;
      }
      
      return false;
    }
  };

  // Show a configuration error notification if we have issues connecting to Supabase
  useEffect(() => {
    if (configError) {
      toast.error("Problemi di connessione al database. Usando modalità demo.", {
        duration: 5000,
        id: "config-error"
      });
    }
  }, [configError]);

  return (
    <div className="min-h-screen bg-white p-6 pt-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/f001bbd0-3515-4169-944c-9a037d5ddae8.png" 
            alt="EVA AI Technologies Logo" 
            className="h-12 md:h-16 mx-auto mb-4" 
          />
          <h1 className="text-2xl font-bold text-emerald-700">EV-AI Guest</h1>
          <p className="text-gray-600">Accedi alla piattaforma con le tue credenziali</p>
        </div>

        {configError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Errore di configurazione</AlertTitle>
            <AlertDescription>
              Impossibile connettersi al database. Utilizzando la modalità demo. Usare username "admin" e password "password".
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="admin" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="admin" 
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all duration-200"
            >
              Amministrazione
            </TabsTrigger>
            <TabsTrigger 
              value="master" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all duration-200"
            >
              Master
            </TabsTrigger>
          </TabsList>
            
          <TabsContent value="admin">
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-md">
              <CardHeader className="border-b border-emerald-100 bg-emerald-50/50">
                <CardTitle className="text-xl text-emerald-700">Amministrazione</CardTitle>
                <CardDescription className="text-emerald-600/80">
                  Accedi per gestire i contenuti del sito
                </CardDescription>
              </CardHeader>
                
              <CardContent className="pt-6">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username" className="text-emerald-700">Username</Label>
                    <Input 
                      id="admin-username"
                      type="text"
                      placeholder="admin"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      disabled={isLoading}
                      className="border-emerald-200 focus-visible:ring-emerald-500"
                    />
                  </div>
                    
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-emerald-700">Password</Label>
                    <Input 
                      id="admin-password"
                      type="password"
                      placeholder="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      disabled={isLoading}
                      className="border-emerald-200 focus-visible:ring-emerald-500"
                    />
                  </div>
                    
                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300"
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
                
              <CardFooter className="text-center justify-center text-xs text-gray-500 border-t border-emerald-100 bg-emerald-50/30">
                Demo: usa username "admin" e password "password"
              </CardFooter>
            </Card>
          </TabsContent>
            
          <TabsContent value="master">
            <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white shadow-md">
              <CardHeader className="border-b border-purple-100 bg-purple-50/50">
                <CardTitle className="text-xl text-purple-700">Master</CardTitle>
                <CardDescription className="text-purple-600/80">
                  Accedi come Master per gestire gli utenti del sistema
                </CardDescription>
              </CardHeader>
                
              <CardContent className="pt-6">
                <form onSubmit={handleMasterLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="master-username" className="text-purple-700">Username Master</Label>
                    <Input 
                      id="master-username"
                      type="text"
                      placeholder="master"
                      value={masterUsername}
                      onChange={(e) => setMasterUsername(e.target.value)}
                      disabled={isLoading}
                      className="border-purple-200 focus-visible:ring-purple-500"
                    />
                  </div>
                    
                  <div className="space-y-2">
                    <Label htmlFor="master-password" className="text-purple-700">Password Master</Label>
                    <Input 
                      id="master-password"
                      type="password"
                      placeholder="********"
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      disabled={isLoading}
                      className="border-purple-200 focus-visible:ring-purple-500"
                    />
                  </div>
                    
                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all duration-300"
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
                
              <CardFooter className="text-center justify-center text-xs text-gray-500 border-t border-purple-100 bg-purple-50/30">
                Demo: usa username "master" e password "master123"
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="w-full py-6 mt-10 border-t border-gray-200">
          <div className="flex justify-center items-center">
            <img 
              src="/lovable-uploads/f001bbd0-3515-4169-944c-9a037d5ddae8.png" 
              alt="EVA AI Technologies Logo" 
              className="h-8 md:h-10" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
