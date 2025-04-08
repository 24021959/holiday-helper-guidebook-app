
import React, { useEffect } from "react";
import MenuIcon from "./MenuIcon";
import { IconData } from "@/hooks/useMenuIcons";
import TranslatedText from "./TranslatedText";

interface MenuIconGridProps {
  icons: IconData[];
  onIconClick: (icon: IconData) => void;
}

const MenuIconGrid: React.FC<MenuIconGridProps> = ({ icons, onIconClick }) => {
  useEffect(() => {
    console.log("MenuIconGrid - Ricevute", icons.length, "icone");
    if (icons.length > 0) {
      console.log("MenuIconGrid - Prima icona:", JSON.stringify(icons[0]));
    }
  }, [icons]);

  if (icons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center p-4 max-w-md">
          <p className="text-gray-600 text-lg font-medium mb-3">
            <TranslatedText text="Menu vuoto" />
          </p>
          <p className="text-gray-500 mb-3">
            <TranslatedText text="Non ci sono pagine disponibili in questa sezione del menu" />
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-700 mb-2 font-medium">
              <TranslatedText text="Come aggiungere pagine:" />
            </p>
            <ul className="text-sm text-amber-600 list-disc pl-5 space-y-2">
              <li>
                <TranslatedText text="Vai all'area amministrativa (/admin)" />
              </li>
              <li>
                <TranslatedText text="Usa la funzione 'Crea Nuova Pagina'" />
              </li>
              <li>
                <TranslatedText text="Assicurati che il campo 'Pubblicato' sia ON" />
              </li>
              <li>
                <TranslatedText text="Le pagine create appariranno automaticamente nel menu" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 h-full">
      {icons.map((icon, index) => (
        <MenuIcon 
          key={icon.id} 
          icon={icon} 
          index={index} 
          onClick={onIconClick} 
        />
      ))}
    </div>
  );
};

export default MenuIconGrid;
