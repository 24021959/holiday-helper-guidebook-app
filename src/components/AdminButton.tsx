
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
        // Changed routing: Admin user goes to menu page
        navigate("/menu");
      } else {
        // Changed routing: Regular user goes to admin panel
        navigate("/admin");
      }
    } else {
      navigate("/login");
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className="text-gray-600 hover:text-emerald-600 transition-colors"
      aria-label={isAdmin ? "Menu" : "Pannello amministrazione"}
      title={isAuthenticated ? (isAdmin ? "Menu" : "Pannello amministrazione") : "Accedi"}
    >
      {isAdmin ? <User size={20} /> : <Settings size={20} />}
    </button>
  );
};

export default AdminButton;
