
import React, { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminButton: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);
  
  const handleClick = () => {
    if (isAuthenticated) {
      navigate("/admin");
    } else {
      navigate("/login");
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className="text-gray-600 hover:text-emerald-600 transition-colors"
      aria-label="Admin Panel"
      title={isAuthenticated ? "Pannello amministrazione" : "Accedi"}
    >
      <Settings size={20} />
    </button>
  );
};

export default AdminButton;
