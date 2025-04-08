
import React, { useEffect } from "react";
import MenuIcon from "./MenuIcon";
import { IconData } from "@/hooks/useMenuIcons";
import TranslatedText from "@/components/TranslatedText";

interface MenuIconGridProps {
  icons: IconData[];
  onIconClick: (icon: IconData) => void;
}

const MenuIconGrid: React.FC<MenuIconGridProps> = ({ icons, onIconClick }) => {
  useEffect(() => {
    console.log("MenuIconGrid - Received", icons.length, "icons");
    console.log("MenuIconGrid - Icon paths:", icons.map(icon => icon.path).join(", "));
    if (icons.length > 0) {
      console.log("MenuIconGrid - First icon:", JSON.stringify(icons[0]));
    }
  }, [icons]);

  if (icons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center p-4 max-w-md">
          <p className="text-gray-600 text-lg font-medium mb-3">
            <TranslatedText text="Empty Menu" />
          </p>
          <p className="text-gray-500 mb-3">
            <TranslatedText text="There are no available pages in this section of the menu" />
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-700 mb-2 font-medium">
              <TranslatedText text="How to add pages:" />
            </p>
            <ul className="text-sm text-amber-600 list-disc pl-5 space-y-2">
              <li>
                <TranslatedText text="Go to the admin area (/admin)" />
              </li>
              <li>
                <TranslatedText text="Use the 'Create New Page' function" />
              </li>
              <li>
                <TranslatedText text="When creating a subpage, select 'Sottopagina' type" />
              </li>
              <li>
                <TranslatedText text="In the parent dropdown, select the correct parent page" />
              </li>
              <li>
                <TranslatedText text="Make sure the 'Published' field is ON" />
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
