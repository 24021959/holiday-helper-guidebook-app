
import React from "react";
import { Button } from "@/components/ui/button";
import { PageData } from "@/pages/Admin";
import { Edit, Trash, Eye } from "lucide-react";

interface PageIconProps {
  iconName: string;
}

export const PageIcon: React.FC<PageIconProps> = ({ iconName }) => {
  // Importare dinamicamente le icone necessarie
  const { FileText, Image, MessageCircle, Info, Map, Utensils, Landmark, Hotel, 
    Wifi, Bus, ShoppingBag, Calendar, Phone, Book, Coffee, Home, Bike } = require("lucide-react");
  
  switch (iconName) {
    case 'FileText': return <FileText className="w-6 h-6" />;
    case 'Image': return <Image className="w-6 h-6" />;
    case 'MessageCircle': return <MessageCircle className="w-6 h-6" />;
    case 'Info': return <Info className="w-6 h-6" />;
    case 'Map': return <Map className="w-6 h-6" />;
    case 'Utensils': return <Utensils className="w-6 h-6" />;
    case 'Landmark': return <Landmark className="w-6 h-6" />;
    case 'Hotel': return <Hotel className="w-6 h-6" />;
    case 'Wifi': return <Wifi className="w-6 h-6" />;
    case 'Bus': return <Bus className="w-6 h-6" />;
    case 'ShoppingBag': return <ShoppingBag className="w-6 h-6" />;
    case 'Calendar': return <Calendar className="w-6 h-6" />;
    case 'Phone': return <Phone className="w-6 h-6" />;
    case 'Book': return <Book className="w-6 h-6" />;
    case 'Coffee': return <Coffee className="w-6 h-6" />;
    case 'Home': return <Home className="w-6 h-6" />;
    case 'Bike': return <Bike className="w-6 h-6" />;
    default: return <FileText className="w-6 h-6" />;
  }
};

interface PageListItemProps {
  page: PageData;
  onDelete: (id: string) => Promise<void>;
  onEdit: (page: PageData) => void;
  onPreview: (path: string) => void;
}

export const PageListItem: React.FC<PageListItemProps> = ({ 
  page, 
  onDelete, 
  onEdit, 
  onPreview 
}) => {
  return (
    <div className="border rounded-lg p-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-blue-200 p-2 rounded-md">
          <PageIcon iconName={page.icon || "FileText"} />
        </div>
        <div>
          <h3 className="font-medium text-lg">{page.title}</h3>
          {page.isSubmenu && (
            <p className="text-xs text-teal-600 mt-1">
              Sottopagina di: {page.parentPath}
            </p>
          )}
          {page.listItems && page.listItems.length > 0 && (
            <p className="text-xs text-emerald-600 mt-1">
              {page.listItems.length} {
                page.listType === "restaurants" ? "ristoranti" :
                page.listType === "activities" ? "attività" : 
                page.listType === "locations" ? "luoghi" : "luoghi"
              }
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onPreview(page.path)}
          className="flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Anteprima</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onEdit(page)}
          className="flex items-center gap-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
        >
          <Edit className="w-4 h-4" />
          <span className="hidden sm:inline">Modifica</span>
        </Button>
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={() => onDelete(page.id)}
          className="flex items-center gap-1"
        >
          <Trash className="w-4 h-4" />
          <span className="hidden sm:inline">Elimina</span>
        </Button>
      </div>
    </div>
  );
};
