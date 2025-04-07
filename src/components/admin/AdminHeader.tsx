
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface AdminHeaderProps {
  isMaster: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ isMaster }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("user_role");
    toast.success("Logout eseguito con successo");
    navigate("/login");
  };
  
  const goToPreview = () => {
    // Indirizza l'utente verso /welcome
    navigate("/welcome");
  };
  
  // Determina il testo del titolo in base al ruolo dell'utente
  const panelTitle = isMaster ? "Pannello Master" : "Pannello Amministratore";

  return (
    <div className={`bg-white shadow-sm border-b ${isMaster ? "bg-gradient-to-r from-purple-500 to-indigo-600" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className={`text-xl font-semibold ${isMaster ? "text-white" : "text-gray-900"}`}>{panelTitle}</h1>
          <div className="flex items-center gap-3">
            <Button 
              onClick={goToPreview}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink size={18} />
              Anteprima Sito
            </Button>
            <button 
              onClick={handleLogout}
              className={`px-3 py-1 ${isMaster ? "bg-white text-purple-700" : "bg-gray-200 hover:bg-gray-300 text-gray-800"} rounded text-sm`}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
