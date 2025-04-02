
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import BackToMenu from "./components/BackToMenu";
import Welcome from "./pages/Welcome";
import Storia from "./pages/Storia";

// Create placeholder pages for each menu item
const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 p-6 pt-20">
      <BackToMenu />
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-emerald-700 mb-4">{title}</h1>
        <p className="text-gray-600">
          Contenuto della pagina {title} in arrivo...
        </p>
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => {
  const hasSelectedLanguage = localStorage.getItem("selectedLanguage") !== null;
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={hasSelectedLanguage ? <Menu /> : <Navigate to="/" />} />
            
            {/* Routes for each icon */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/storia" element={<Storia />} />
            <Route path="/servizi-hotel" element={<PlaceholderPage title="Servizi hotel" />} />
            <Route path="/servizi-esterni" element={<PlaceholderPage title="Servizi esterni" />} />
            <Route path="/ristorante" element={<PlaceholderPage title="Ristorante" />} />
            <Route path="/scopri-territorio" element={<PlaceholderPage title="Scopri il territorio" />} />
            <Route path="/location" element={<PlaceholderPage title="Posizione" />} />
            <Route path="/wifi" element={<PlaceholderPage title="Wifi" />} />
            <Route path="/activities" element={<PlaceholderPage title="Attività" />} />
            <Route path="/transport" element={<PlaceholderPage title="Trasporti" />} />
            <Route path="/shopping" element={<PlaceholderPage title="Shopping" />} />
            <Route path="/contacts" element={<PlaceholderPage title="Contatti" />} />
            <Route path="/events" element={<PlaceholderPage title="Eventi" />} />
            <Route path="/gallery" element={<PlaceholderPage title="Galleria" />} />
            <Route path="/info" element={<PlaceholderPage title="Info" />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
