
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import BackToMenu from "./components/BackToMenu";

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
            <Route path="/welcome" element={<PlaceholderPage title="Benvenuto" />} />
            <Route path="/checkin" element={<PlaceholderPage title="Check-in" />} />
            <Route path="/location" element={<PlaceholderPage title="Posizione" />} />
            <Route path="/wifi" element={<PlaceholderPage title="Wifi" />} />
            <Route path="/transport" element={<PlaceholderPage title="Trasporti" />} />
            <Route path="/info" element={<PlaceholderPage title="Info" />} />
            <Route path="/activities" element={<PlaceholderPage title="Attività" />} />
            <Route path="/equipment" element={<PlaceholderPage title="Equipaggiamenti" />} />
            <Route path="/shopping" element={<PlaceholderPage title="Shopping" />} />
            <Route path="/contacts" element={<PlaceholderPage title="Contatti" />} />
            <Route path="/messages" element={<PlaceholderPage title="Messaggi" />} />
            <Route path="/profile" element={<PlaceholderPage title="Profilo" />} />
            <Route path="/events" element={<PlaceholderPage title="Eventi" />} />
            <Route path="/settings" element={<PlaceholderPage title="Impostazioni" />} />
            <Route path="/gallery" element={<PlaceholderPage title="Galleria" />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
