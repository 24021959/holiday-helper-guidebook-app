
import React from "react";
import NavigateBack from "./NavigateBack";
import { useLocation } from "react-router-dom";

const BackToMenu: React.FC = () => {
  const location = useLocation();
  const parentPath = location.state?.parentPath || null;
  
  return <NavigateBack parentPath={parentPath} />;
};

export default BackToMenu;
