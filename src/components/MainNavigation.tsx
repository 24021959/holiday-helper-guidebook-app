
import React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/TranslationContext";
import TranslatedText from "./TranslatedText";

const MainNavigation: React.FC = () => {
  const { language } = useTranslation();
  
  // Prepara il prefisso della lingua per i percorsi
  const langPrefix = language !== 'it' ? `/${language}` : '';
  
  return (
    <div className="w-full bg-gray-100 border-b border-gray-200">
      <div className="container mx-auto px-4 py-2">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link 
                to="/home" 
                className="flex h-9 items-center px-4 text-sm font-medium text-gray-700 hover:text-emerald-700 transition-colors"
              >
                <TranslatedText text="Home" />
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-gray-700 hover:text-emerald-700">
                <TranslatedText text="Menu" />
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-2 p-2">
                  <li>
                    <Link 
                      to={`${langPrefix}/menu`}
                      className="block select-none rounded-md p-2 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <TranslatedText text="Menu Principale" />
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/storia"
                      className="block select-none rounded-md p-2 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <TranslatedText text="Storia" />
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link 
                to="/welcome" 
                className="flex h-9 items-center px-4 text-sm font-medium text-gray-700 hover:text-emerald-700 transition-colors"
              >
                <TranslatedText text="Benvenuto" />
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link 
                to="/admin" 
                className="flex h-9 items-center px-4 text-sm font-medium text-gray-700 hover:text-emerald-700 transition-colors"
              >
                <TranslatedText text="Admin" />
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default MainNavigation;
