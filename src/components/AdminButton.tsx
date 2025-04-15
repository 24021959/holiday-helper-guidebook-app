
import React from "react";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminButton: React.FC = () => {
  const navigate = useNavigate();
  
  const handleClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
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
      title="Pannello amministrazione"
    >
      <Settings size={20} />
    </button>
  );
};

export default AdminButton;
