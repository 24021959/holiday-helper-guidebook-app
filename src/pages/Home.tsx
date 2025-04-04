
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUserEntry = () => {
    localStorage.setItem("selectedLanguage", "it");
    navigate("/menu");
  };
  
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple demo authentication
    setTimeout(() => {
      if (adminUsername === "admin" && adminPassword === "password") {
        localStorage.setItem("admin_token", "demo_token");
        toast.success("Login effettuato con successo");
        navigate("/admin");
      } else {
        toast.error("Credenziali non valide");
      }
      setIsLoading(false);
    }, 500);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-100">
      <div className="w-full bg-gradient-to-r from-teal-400 to-emerald-500 py-4 px-4 text-center shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-center">
          <h1 className="text-white font-bold text-xl md:text-2xl tracking-wide">Locanda dell'Angelo</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="guest" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="guest">Ospiti</TabsTrigger>
              <TabsTrigger value="admin">Amministrazione</TabsTrigger>
            </TabsList>
            
            <TabsContent value="guest">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-emerald-700">Benvenuti</CardTitle>
                  <CardDescription>
                    Accedi come ospite per esplorare le informazioni della struttura
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  <div className="w-full max-w-sm mx-auto">
                    <Button 
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                      onClick={handleUserEntry}
                      size="lg"
                    >
                      Entra come Ospite
                    </Button>
                  </div>
                </CardContent>
                
                <CardFooter className="text-center justify-center text-sm text-gray-500">
                  Nessuna registrazione necessaria per gli ospiti
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="admin">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-emerald-700">Amministrazione</CardTitle>
                  <CardDescription>
                    Accedi con le tue credenziali per gestire i contenuti
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-username">Username</Label>
                      <Input 
                        id="admin-username"
                        type="text"
                        placeholder="admin"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input 
                        id="admin-password"
                        type="password"
                        placeholder="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
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
                
                <CardFooter className="text-center justify-center text-xs text-gray-500">
                  Demo: usa username "admin" e password "password"
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
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

export default Home;
