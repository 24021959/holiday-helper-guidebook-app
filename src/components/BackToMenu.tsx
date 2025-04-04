
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TranslatedText from "./TranslatedText";

const BackToMenu: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/menu");
  };

  return (
    <Button
      variant="ghost"
      className="mb-4 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
      onClick={handleBack}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      <TranslatedText text="Torna al Menu" />
    </Button>
  );
};

export default BackToMenu;
