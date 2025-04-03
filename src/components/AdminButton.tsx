
import React, { useEffect, useState } from "react";
import { Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminButton: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check authentication status from localStorage
    const authStatus = localStorage.getItem("isAuthenticated");
    const userType = localStorage.getItem("userType");
    const adminToken = localStorage.getItem("admin_token");
    
    if (authStatus === "true") {
      setIsAuthenticated(true);
      setIsAdmin(userType === "admin" || adminToken !== null);
    }
  }, []);
  
  const handleClick = () => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        // Redirect regular user to their menu
        navigate("/menu");
      }
    } else {
      navigate("/login");
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className="text-gray-600 hover:text-emerald-600 transition-colors"
      aria-label={isAdmin ? "Admin Panel" : "Profilo Utente"}
      title={isAuthenticated ? (isAdmin ? "Pannello amministrazione" : "Profilo utente") : "Accedi"}
    >
      {isAdmin ? <Settings size={20} /> : <User size={20} />}
    </button>
  );
};

export default AdminButton;
