
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  return (
    <header className="bg-emerald-700 shadow-md py-4 px-6 text-white">
      <div className="container mx-auto flex justify-center items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Locanda dell'Angelo</h1>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-emerald-800 text-white py-6 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="font-medium">Locanda dell'Angelo</p>
            <p className="text-sm opacity-80">Via Roma 123, 12345 Città, Italia</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm opacity-80">
              © {new Date().getFullYear()} Locanda dell'Angelo - Tutti i diritti riservati
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  
  // User login state
  const [userUsername, setUserUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  
  // Admin login state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUserLoading(true);
    
    try {
      // Per demo, credenziali hardcoded
      if (userUsername.toLowerCase() === "user" && userPassword === "password") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userType", "regular");
        toast.success("Login utente effettuato con successo!");
        navigate("/menu");
      } else {
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
      // Per demo, credenziali hardcoded per admin
      if (adminEmail.toLowerCase() === "admin" && adminPassword === "password") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userType", "admin");
        localStorage.setItem("admin_token", "demo_token");
        toast.success("Login amministratore effettuato con successo!");
        navigate("/admin");
      } else {
        toast.error("Credenziali amministratore non valide");
      }
    } catch (error) {
      console.error("Errore durante il login admin:", error);
      toast.error("Errore durante il login. Riprova più tardi.");
    } finally {
      setIsAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 to-emerald-100">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-emerald-700">BENVENUTO</CardTitle>
            <CardDescription>Accedi all'applicazione</CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User size={16} />
                <span>Utente</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield size={16} />
                <span>Amministratore</span>
              </TabsTrigger>
            </TabsList>
            
            <CardContent>
              <TabsContent value="user">
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      type="text"
                      placeholder="Inserisci username" 
                      value={userUsername}
                      onChange={(e) => setUserUsername(e.target.value)}
                      disabled={isUserLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userPassword">Password</Label>
                    <Input 
                      id="userPassword" 
                      type="password" 
                      placeholder="Inserisci password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      disabled={isUserLoading}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isUserLoading}
                  >
                    {isUserLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accesso in corso...
                      </>
                    ) : (
                      "Accedi come Utente"
                    )}
                  </Button>
                  
                  <div className="text-xs text-gray-500 text-center mt-2">
                    <p>Demo: username "user" e password "password"</p>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email / Username</Label>
                    <Input 
                      id="adminEmail" 
                      type="text"
                      placeholder="Inserisci email o username" 
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      disabled={isAdminLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password</Label>
                    <Input 
                      id="adminPassword" 
                      type="password"
                      placeholder="Inserisci password" 
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      disabled={isAdminLoading}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isAdminLoading}
                  >
                    {isAdminLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accesso in corso...
                      </>
                    ) : (
                      "Accedi come Admin"
                    )}
                  </Button>
                  
                  <div className="text-xs text-gray-500 text-center mt-2">
                    <p>Demo: username "admin" e password "password"</p>
                  </div>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
          
          <CardFooter className="flex justify-center pt-2">
            <div className="text-sm text-gray-600">
              Benvenuto alla Locanda dell'Angelo
            </div>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
