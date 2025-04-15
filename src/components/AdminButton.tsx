
import React from "react";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminButton: React.FC = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate("/login");
  };
  
  return (
    <button
      onClick={handleClick}
      className="text-gray-600 hover:text-emerald-600 transition-colors"
      aria-label="Login"
      title="Accedi"
    >
      <Settings size={20} />
    </button>
  );
};

export default AdminButton;
