
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Home from "./pages/Home";
import SubMenu from "./pages/SubMenu";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Welcome from "./pages/Welcome";
import Storia from "./pages/Storia";
import NotFound from "./pages/NotFound";
import PreviewPage from "./pages/PreviewPage";
import { TranslationProvider } from "./context/TranslationContext";
import { Toaster } from "sonner";
import ChatbotBubble from "./components/ChatbotBubble";
import DevNavigation from "@/components/DevNavigation";
import { Suspense, lazy } from "react";

function App() {
  return (
    <>
      {/* Aggiungi il componente DevNavigation in cima all'app */}
      <DevNavigation />
      
      <TranslationProvider>
        <Router>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* Index and system pages */}
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/storia" element={<Storia />} />
              
              {/* Main menu routes with language support */}
              <Route path="/menu" element={<Menu />} />
              <Route path="/en/menu" element={<Menu />} />
              <Route path="/fr/menu" element={<Menu />} />
              <Route path="/es/menu" element={<Menu />} />
              <Route path="/de/menu" element={<Menu />} />
              
              {/* SubMenu routes with improved path handling */}
              <Route path="/submenu/:parentPath" element={<SubMenu />} />
              <Route path="/submenu/:language/:path" element={<SubMenu />} />
              
              {/* Content page routes - both with and without language prefixes */}
              <Route path="/preview/*" element={<PreviewPage />} />
              
              {/* Content pages without language prefix */}
              <Route path="/:path" element={<PreviewPage />} />
              <Route path="/:parent/:child" element={<PreviewPage />} />
              
              {/* Content pages with language prefixes */}
              <Route path="/en/:path" element={<PreviewPage />} />
              <Route path="/en/:parent/:child" element={<PreviewPage />} />
              <Route path="/fr/:path" element={<PreviewPage />} />
              <Route path="/fr/:parent/:child" element={<PreviewPage />} />
              <Route path="/es/:path" element={<PreviewPage />} />
              <Route path="/es/:parent/:child" element={<PreviewPage />} />
              <Route path="/de/:path" element={<PreviewPage />} />
              <Route path="/de/:parent/:child" element={<PreviewPage />} />
              
              {/* Catch-all for unmatched routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          
          {/* Ensure Chatbot is wrapped in error boundary */}
          <Suspense fallback={null}>
            <ChatbotBubble />
          </Suspense>
          
          <Toaster position="top-right" richColors />
        </Router>
      </TranslationProvider>
    </>
  );
}

export default App;
