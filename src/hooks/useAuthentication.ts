
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { md5 } from "js-md5";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  isAuthenticated: boolean;
  userRole: string | null;
  username: string | null;
  isLoading: boolean;
  configError: boolean;
}

export const useAuthentication = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: localStorage.getItem("isAuthenticated") === "true",
    userRole: localStorage.getItem("user_role"),
    username: localStorage.getItem("admin_user"),
    isLoading: false,
    configError: false
  });
  const navigate = useNavigate();

  // Verifica la connessione al database
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setAuthState(prev => ({ ...prev, configError: false }));
        
        try {
          console.log("Verifica della connessione al database...");
          const { error } = await supabase.from('header_settings').select('count').limit(1);
          
          if (error) {
            if (error.code === '42P01') {
              console.log("La tabella non esiste, ma la connessione funziona");
              toast.info("Modalità demo attiva.", {
                duration: 5000,
                id: "demo-mode-info"
              });
              setAuthState(prev => ({ ...prev, configError: false }));
            } else {
              console.error("Errore nel controllo della connessione a Supabase:", error);
              toast.error("Problemi di connessione al database. Usando modalità demo.", {
                duration: 5000,
                id: "config-error"
              });
              setAuthState(prev => ({ ...prev, configError: true }));
            }
          } else {
            console.log("Connessione al database riuscita");
            setAuthState(prev => ({ ...prev, configError: false }));
          }
        } catch (err) {
          console.error("Errore di connessione a Supabase:", err);
          toast.error("Problemi di connessione al database. Usando modalità demo.", {
            duration: 5000,
            id: "config-error"
          });
          setAuthState(prev => ({ ...prev, configError: true }));
        }
      } catch (err) {
        console.error("Errore durante il controllo della connessione:", err);
        toast.error("Problemi di connessione al database. Usando modalità demo.", {
          duration: 5000,
          id: "config-error"
        });
        setAuthState(prev => ({ ...prev, configError: true }));
      }
    };
    
    checkConnection();
  }, []);

  const login = async (username: string, password: string, role: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Gestione demo
      if ((role === "admin" && username === "admin" && password === "password") || 
          (role === "master" && username === "master" && password === "master123")) {
        
        const token = role === "master" ? "master_token" : "demo_token";
        
        localStorage.setItem("admin_token", token);
        localStorage.setItem("admin_user", username);
        localStorage.setItem("user_role", role);
        localStorage.setItem("isAuthenticated", "true");
        
        setAuthState({
          isAuthenticated: true,
          userRole: role,
          username: username,
          isLoading: false,
          configError: authState.configError
        });
        
        toast.success(`Login ${role === "master" ? "Master" : ""} effettuato con successo (modalità demo)`);
        navigate("/admin");
        return true;
      }
      
      // Gestione di errori di configurazione
      if (authState.configError) {
        if ((role === "admin" && username === "admin" && password === "password") || 
            (role === "master" && username === "master" && password === "master123")) {
          const token = role === "master" ? "master_token" : "demo_token";
          
          localStorage.setItem("admin_token", token);
          localStorage.setItem("admin_user", username);
          localStorage.setItem("user_role", role);
          localStorage.setItem("isAuthenticated", "true");
          
          setAuthState({
            isAuthenticated: true,
            userRole: role,
            username: username,
            isLoading: false,
            configError: true
          });
          
          toast.success(`Login ${role === "master" ? "Master" : ""} effettuato con successo (modalità demo)`);
          navigate("/admin");
          return true;
        }
        
        return false;
      }
      
      // Login tramite Supabase
      try {
        const { data, error } = await supabase.functions.invoke("admin_users_helpers", {
          body: { 
            action: "check_login",
            email: username,
            password_hash: md5(password)
          }
        });

        if (error) {
          console.error("Errore durante la verifica del login:", error);
          
          // Fallback alle credenziali demo
          if ((role === "admin" && username === "admin" && password === "password") || 
              (role === "master" && username === "master" && password === "master123")) {
            
            const token = role === "master" ? "master_token" : "demo_token";
            
            localStorage.setItem("admin_token", token);
            localStorage.setItem("admin_user", username);
            localStorage.setItem("user_role", role);
            localStorage.setItem("isAuthenticated", "true");
            
            setAuthState({
              isAuthenticated: true,
              userRole: role,
              username: username,
              isLoading: false,
              configError: true
            });
            
            toast.success(`Login ${role === "master" ? "Master" : ""} effettuato con successo (modalità demo)`);
            navigate("/admin");
            return true;
          }
          
          return false;
        }
        
        if (data && data.success) {
          localStorage.setItem("admin_token", "user_token");
          localStorage.setItem("admin_user", username);
          localStorage.setItem("user_role", data.user.role || role);
          localStorage.setItem("isAuthenticated", "true");
          
          setAuthState({
            isAuthenticated: true,
            userRole: data.user.role || role,
            username: username,
            isLoading: false,
            configError: false
          });
          
          toast.success("Login effettuato con successo");
          navigate("/admin");
          return true;
        }
        
        return false;
      } catch (err) {
        console.error("Errore durante l'invocazione della funzione:", err);
        
        // Fallback alle credenziali demo
        if ((role === "admin" && username === "admin" && password === "password") || 
            (role === "master" && username === "master" && password === "master123")) {
          
          const token = role === "master" ? "master_token" : "demo_token";
          
          localStorage.setItem("admin_token", token);
          localStorage.setItem("admin_user", username);
          localStorage.setItem("user_role", role);
          localStorage.setItem("isAuthenticated", "true");
          
          setAuthState({
            isAuthenticated: true,
            userRole: role,
            username: username,
            isLoading: false,
            configError: true
          });
          
          toast.success(`Login ${role === "master" ? "Master" : ""} effettuato con successo (modalità demo)`);
          navigate("/admin");
          return true;
        }
        
        return false;
      }
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("user_role");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentRoute");
    
    setAuthState({
      isAuthenticated: false,
      userRole: null,
      username: null,
      isLoading: false,
      configError: authState.configError
    });
    
    toast.success("Logout effettuato con successo");
    navigate("/login");
  };

  return {
    ...authState,
    login,
    logout
  };
};
