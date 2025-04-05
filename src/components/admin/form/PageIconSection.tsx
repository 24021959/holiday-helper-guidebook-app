
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, Image, MessageCircle, Info, Map, Utensils, Landmark, 
  Hotel, Wifi, Bus, ShoppingBag, Calendar, Phone, Book, Coffee, 
  Home, Bike, LucideIcon
} from "lucide-react";

interface PageIconSectionProps {
  icon: string;
  setIcon: (icon: string) => void;
}

// Map of icon names to their components
const iconComponents: Record<string, LucideIcon> = {
  FileText,
  Image,
  MessageCircle,
  Info,
  Map,
  Utensils,
  Landmark,
  Hotel,
  Wifi,
  Bus,
  ShoppingBag,
  Calendar,
  Phone,
  Book,
  Coffee,
  Home,
  Bike
};

export const PageIconSection: React.FC<PageIconSectionProps> = ({
  icon,
  setIcon
}) => {
  // Get the icon component for the currently selected icon
  const SelectedIcon = iconComponents[icon] || FileText;
  
  return (
    <div className="space-y-2">
      <Label htmlFor="icon">Icona</Label>
      <Select 
        value={icon} 
        onValueChange={setIcon}
      >
        <SelectTrigger className="flex items-center">
          <div className="flex items-center gap-2">
            <SelectedIcon className="h-5 w-5" />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {Object.entries(iconComponents).map(([name, Icon]) => (
            <SelectItem key={name} value={name} className="flex items-center gap-2 py-3">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <span>{name === 'FileText' ? 'Documento' : 
                       name === 'Image' ? 'Immagine' :
                       name === 'MessageCircle' ? 'Messaggio' :
                       name === 'Info' ? 'Informazioni' :
                       name === 'Map' ? 'Mappa' :
                       name === 'Utensils' ? 'Ristorante' :
                       name === 'Landmark' ? 'Luogo' :
                       name === 'Hotel' ? 'Hotel' :
                       name === 'Wifi' ? 'WiFi' :
                       name === 'Bus' ? 'Trasporti' :
                       name === 'ShoppingBag' ? 'Shopping' :
                       name === 'Calendar' ? 'Eventi' :
                       name === 'Phone' ? 'Contatti' :
                       name === 'Book' ? 'Guida' :
                       name === 'Coffee' ? 'Bar' :
                       name === 'Home' ? 'Casa' :
                       name === 'Bike' ? 'Attività' : name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
