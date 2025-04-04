
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import Home from '@/pages/Home'
import Welcome from '@/pages/Welcome'
import Index from '@/pages/Index'
import Menu from '@/pages/Menu'
import SubMenu from '@/pages/SubMenu'
import Login from '@/pages/Login'
import Admin from '@/pages/Admin'
import Storia from '@/pages/Storia'
import NotFound from '@/pages/NotFound'
import PreviewPage from '@/pages/PreviewPage'
import { supabase } from './integrations/supabase/client'

// Componente per gestire le pagine dinamiche create dall'amministratore
const DynamicPage = () => {
  const { pageRoute } = useParams<{ pageRoute: string }>();
  const location = useLocation();
  
  // Se non c'è path, tornare alla homepage
  if (!pageRoute) {
    return <Navigate to="/menu" replace />;
  }
  
  // Costruisci il path effettivo basato sull'URL corrente
  const actualPath = location.pathname;
  
  return <PreviewPage pageRoute={actualPath} />;
};

// Componente Protected per verificare l'autenticazione
const Protected = ({ children }: { children: React.ReactNode }) => {
  const isAuth = localStorage.getItem("isAuthenticated") === "true";
  
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const [headerSettings, setHeaderSettings] = useState<{
    logoUrl?: string;
    headerColor?: string;
    establishmentName?: string;
  }>({});

  useEffect(() => {
    // Aggiungi lo script del chatbot all'head se presente nelle impostazioni
    const loadChatbotSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('chatbot_settings')
          .select('code')
          .limit(1)
          .single();
        
        if (error) throw error;
        
        if (data && data.code) {
          // Crea un nuovo elemento script
          const script = document.createElement('script');
          script.innerHTML = data.code;
          document.head.appendChild(script);
          console.info("Script del chatbot predefinito aggiunto nell'head");
        }
      } catch (error) {
        console.warn("Errore nel caricamento delle impostazioni del chatbot:", error);
      }
    };
    
    // Carica impostazioni dell'header
    const loadHeaderSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          // PGRST116 è "did not return a single row" 
          console.warn("Errore nel caricamento delle impostazioni header:", error);
          return;
        }
        
        if (data) {
          setHeaderSettings({
            logoUrl: data.logo_url,
            headerColor: data.header_color,
            establishmentName: data.establishment_name
          });
          
          // Salva anche in localStorage come fallback
          localStorage.setItem("headerSettings", JSON.stringify({
            logoUrl: data.logo_url,
            headerColor: data.header_color,
            establishmentName: data.establishment_name
          }));
        }
      } catch (error) {
        console.warn("Errore nel caricamento delle impostazioni header:", error);
      }
    };
    
    loadChatbotSettings();
    loadHeaderSettings();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login headerSettings={headerSettings} />} />
        <Route path="/welcome" element={<Welcome headerSettings={headerSettings} />} />
        <Route path="/menu" element={<Menu headerSettings={headerSettings} />} />
        <Route path="/storia" element={<Storia headerSettings={headerSettings} />} />
        <Route path="/submenu/:parentPath" element={<SubMenu headerSettings={headerSettings} />} />
        <Route path="/preview/*" element={<PreviewPage headerSettings={headerSettings} />} />
        
        {/* Protected routes */}
        <Route 
          path="/admin" 
          element={
            <Protected>
              <Admin />
            </Protected>
          } 
        />
        <Route path="/home" element={<Home headerSettings={headerSettings} />} />
        
        {/* Rotta speciale per tutte le altre pagine - cattura le pagine dinamiche */}
        <Route path="/:pageRoute/*" element={<DynamicPage />} />
        
        {/* Rotta per 404 Not Found - deve essere l'ultima */}
        <Route path="*" element={<NotFound headerSettings={headerSettings} />} />
      </Routes>
    </Router>
  )
}

export default App
