
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

const BackToMenu = () => {
  return (
    <Button
      variant="ghost"
      size="lg"
      className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-emerald-100 text-emerald-700 shadow-md border border-emerald-100 rounded-full px-5"
      asChild
    >
      <Link to="/">
        <ArrowLeft className="h-5 w-5" />
        <span>Menu</span>
      </Link>
    </Button>
  );
};

export default BackToMenu;
