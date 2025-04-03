
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import BackToMenu from "@/components/BackToMenu";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulazione di autenticazione
    setTimeout(() => {
      // Demo credentials
      if (username === "admin" && password === "password") {
        localStorage.setItem("isAuthenticated", "true");
        toast.success("Login effettuato con successo!");
        navigate("/admin");
      } else {
        toast.error("Credenziali non valide");
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-6 pt-20">
      <BackToMenu />
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-emerald-700 mb-6 text-center">Accesso Amministrazione</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
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
              placeholder="password"
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Accesso in corso..." : "Accedi"}
          </Button>
          
          <div className="text-xs text-gray-500 text-center mt-4">
            Per demo usa: username "admin" e password "password"
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
