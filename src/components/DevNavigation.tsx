
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Home, Menu, Settings, FileText, History } from "lucide-react";

/**
 * Componente di navigazione per sviluppatori che consente di accedere facilmente a tutte le pagine dell'applicazione.
 * Questo componente è utile durante lo sviluppo per navigare tra le diverse pagine senza dover usare i link di navigazione dell'app.
 */
const DevNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Struttura delle pagine dell'applicazione per facile navigazione
  const pages = [
    { name: "Index (Language Select)", path: "/" },
    { name: "Menu (Italiano)", path: "/menu" },
    { name: "Menu (English)", path: "/en/menu" },
    { name: "Menu (Français)", path: "/fr/menu" },
    { name: "Menu (Español)", path: "/es/menu" },
    { name: "Menu (Deutsch)", path: "/de/menu" },
    { name: "Welcome", path: "/welcome" },
    { name: "Storia", path: "/storia" },
    { name: "Admin Panel", path: "/admin" },
    { name: "Login", path: "/login" }
  ];
  
  // Determina la pagina corrente
  const currentPage = pages.find(page => page.path === location.pathname) || {
    name: "Page: " + location.pathname,
    path: location.pathname
  };
  
  return (
    <div className="fixed top-0 left-0 z-50 bg-gray-900 text-white p-2 rounded-br-lg shadow-lg">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="text-white hover:bg-gray-800 h-auto py-1 px-2">
            <Home className="h-4 w-4 mr-1" />
            <span className="text-xs font-normal">Dev Nav</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-gray-900 text-white border-gray-700">
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 border-b border-gray-700">
            Current: {currentPage.name}
          </div>
          
          {pages.map((page) => (
            <DropdownMenuItem 
              key={page.path}
              onClick={() => navigate(page.path)}
              className="text-sm cursor-pointer hover:bg-gray-800"
            >
              {page.path === "/" && <Home className="h-3.5 w-3.5 mr-2" />}
              {page.path.includes("/menu") && <Menu className="h-3.5 w-3.5 mr-2" />}
              {page.path === "/admin" && <Settings className="h-3.5 w-3.5 mr-2" />}
              {(page.path === "/welcome" || page.path === "/storia") && 
                <FileText className="h-3.5 w-3.5 mr-2" />}
              {page.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DevNavigation;
