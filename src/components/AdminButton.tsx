
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
      className="fixed bottom-5 right-5 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
      aria-label="Admin Panel"
      title={isAuthenticated ? "Pannello amministrazione" : "Accedi"}
    >
      <Settings size={24} />
    </button>
  );
};

export default AdminButton;
