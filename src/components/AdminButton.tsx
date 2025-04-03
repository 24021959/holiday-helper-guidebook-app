
import React from "react";
import { useNavigate } from "react-router-dom";

// This component is no longer used for login access
// It's kept as a placeholder in case we need it for other functionality later
const AdminButton: React.FC = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate("/menu");
  };
  
  // Return null since we don't want this button displayed anymore
  return null;
};

export default AdminButton;
