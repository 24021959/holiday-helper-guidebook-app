
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

// Component to handle dynamic pages created by the administrator
const DynamicPage = () => {
  const { '*': pageRoute } = useParams<{ '*': string }>();
  const location = useLocation();
  
  // If there's no path, return to the homepage
  if (!pageRoute) {
    return <Navigate to="/menu" replace />;
  }
  
  // Build the actual path from the URL pathname
  const actualPath = location.pathname;
  console.log("DynamicPage - Loaded path:", actualPath);
  
  return <PreviewPage pageRoute={actualPath} />;
};

// Protected component to verify authentication
const Protected = ({ children }: { children: React.ReactNode }) => {
  const isAuth = localStorage.getItem("admin_token") !== null;
  
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
    // Load header settings
    const loadHeaderSettings = async () => {
      try {
        // First try from localStorage as fallback
        const cachedSettings = localStorage.getItem("headerSettings");
        if (cachedSettings) {
          try {
            const parsed = JSON.parse(cachedSettings);
            setHeaderSettings(parsed);
            console.log("Loaded header settings from cache:", parsed);
          } catch (err) {
            console.error("Error parsing header settings from localStorage:", err);
          }
        }
        
        const { data, error } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "did not return a single row" 
          console.warn("Error loading header settings:", error);
          return;
        }
        
        if (data) {
          const newSettings = {
            logoUrl: data.logo_url,
            headerColor: data.header_color,
            establishmentName: data.establishment_name
          };
          
          setHeaderSettings(newSettings);
          
          // Also save to localStorage as fallback
          localStorage.setItem("headerSettings", JSON.stringify(newSettings));
          console.log("Updated header settings from database:", newSettings);
        }
      } catch (error) {
        console.warn("Error loading header settings:", error);
      }
    };
    
    loadHeaderSettings();
  }, []);

  return (
    <TranslationProvider>
      <Router>
        <Routes>
          {/* Redirect the root path to menu */}
          <Route path="/" element={<Navigate to="/menu" replace />} />
          
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          
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
          
          {/* Specific routes for submenu */}
          <Route path="/submenu/:parentPath" element={<SubMenu />} />
          
          {/* Preview route for admin */}
          <Route path="/preview/*" element={<PreviewPage />} />
          
          {/* IMPORTANTE: Aggiungere route dirette per tutte le pagine dinamiche creando
              un pattern di rotta che carica le pagine dinamiche direttamente dall'URL */}
          <Route path="/:pageSlug" element={<PreviewPage />} />
          
          {/* Manteniamo anche il vecchio pattern per retrocompatibilità */}
          <Route path="/page/*" element={<DynamicPage />} />
          
          {/* Route for 404 Not Found - must be the last one */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* ChatbotBubble will handle its own visibility based on route */}
        <ChatbotBubble />
      </Router>
    </TranslationProvider>
  )
}

export default App
