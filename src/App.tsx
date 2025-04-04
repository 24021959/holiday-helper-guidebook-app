
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
import { TranslationProvider } from './context/TranslationContext'
import ChatbotBubble from '@/components/ChatbotBubble'

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
    
    loadHeaderSettings();
  }, []);

  return (
    <TranslationProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/storia" element={<Storia />} />
          <Route path="/submenu/:parentPath" element={<SubMenu />} />
          <Route path="/preview/*" element={<PreviewPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/admin" 
            element={
              <Protected>
                <Admin />
              </Protected>
            } 
          />
          <Route path="/home" element={<Home />} />
          
          {/* Rotta speciale per tutte le altre pagine - cattura le pagine dinamiche */}
          <Route path="/:pageRoute/*" element={<DynamicPage />} />
          
          {/* Rotta per 404 Not Found - deve essere l'ultima */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* ChatbotBubble will be conditionally rendered based on current route */}
        <ChatbotBubble />
      </Router>
    </TranslationProvider>
  )
}

export default App
