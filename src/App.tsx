
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Home from "./pages/Home";
import SubMenu from "./pages/SubMenu";
import Login from "./pages/Login";
import AdminPage from "./pages/AdminPage";
import Welcome from "./pages/Welcome";
import Storia from "./pages/Storia";
import NotFound from "./pages/NotFound";
import PreviewPage from "./pages/PreviewPage";
import AutoTranslatePage from "./pages/AutoTranslatePage";
import { TranslationProvider } from "./context/TranslationContext";
import { Toaster } from "sonner";
import ChatbotBubble from "./components/ChatbotBubble";

function App() {
  // Verifica se l'utente è autenticato
  const isAuthenticated = () => {
    return localStorage.getItem("isAuthenticated") === "true";
  };

  return (
    <TranslationProvider>
      <Router>
        <Routes>
          {/* Pagine principali */}
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={
            isAuthenticated() ? <Navigate to="/admin" /> : <Login />
          } />
          <Route 
            path="/admin" 
            element={isAuthenticated() ? <AdminPage /> : <Navigate to="/login" />} 
          />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/storia" element={<Storia />} />
          <Route path="/auto-translate" element={<AutoTranslatePage />} />
          
          {/* Route del menu principale con supporto multilingua */}
          <Route path="/menu" element={<Menu />} />
          <Route path="/en/menu" element={<Menu />} />
          <Route path="/fr/menu" element={<Menu />} />
          <Route path="/es/menu" element={<Menu />} />
          <Route path="/de/menu" element={<Menu />} />
          
          {/* Route per i sottomenu con gestione migliorata dei percorsi */}
          <Route path="/submenu/:parentPath" element={<SubMenu />} />
          <Route path="/submenu/:language/:path" element={<SubMenu />} />
          
          {/* Route delle pagine di contenuto - con e senza prefissi di lingua */}
          <Route path="/preview/*" element={<PreviewPage />} />
          
          {/* Pagine di contenuto senza prefisso di lingua */}
          <Route path="/:path" element={<PreviewPage />} />
          <Route path="/:parent/:child" element={<PreviewPage />} />
          
          {/* Pagine di contenuto con prefissi di lingua */}
          <Route path="/en/:path" element={<PreviewPage />} />
          <Route path="/en/:parent/:child" element={<PreviewPage />} />
          <Route path="/fr/:path" element={<PreviewPage />} />
          <Route path="/fr/:parent/:child" element={<PreviewPage />} />
          <Route path="/es/:path" element={<PreviewPage />} />
          <Route path="/es/:parent/:child" element={<PreviewPage />} />
          <Route path="/de/:path" element={<PreviewPage />} />
          <Route path="/de/:parent/:child" element={<PreviewPage />} />
          
          {/* Catch-all per route non corrispondenti */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatbotBubble />
      </Router>
      <Toaster position="top-right" />
    </TranslationProvider>
  );
}

export default App;
