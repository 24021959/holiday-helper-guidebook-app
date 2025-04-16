
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  FileText, Image, MessageCircle, Info, Map, Utensils, Landmark, 
  Hotel, Wifi, Bus, ShoppingBag, Calendar, Phone, Book, Coffee, 
  Home, Bike, Camera, Globe, Mountain, MapPin, Newspaper, Music, 
  Heart, Trees, Users, ShoppingCart, Car, Building, Palmtree,
  UtensilsCrossed, Bed, Shirt, Key, PawPrint, PartyPopper, Trophy,
  Plane, Train, LucideIcon
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
  Bike,
  Camera,
  Globe,
  Mountain,
  MapPin,
  Newspaper,
  Music,
  Heart,
  Trees,
  Users,
  ShoppingCart,
  Car,
  Building,
  Palmtree,
  UtensilsCrossed,
  Bed,
  Shirt,
  Key,
  PawPrint,
  PartyPopper,
  Trophy,
  Plane,
  Train
};

// Translations for icon names
const iconTranslations: Record<string, string> = {
  'FileText': 'Documento',
  'Image': 'Immagine',
  'MessageCircle': 'Messaggio',
  'Info': 'Informazioni',
  'Map': 'Mappa',
  'Utensils': 'Ristorante',
  'Landmark': 'Monumento',
  'Hotel': 'Hotel',
  'Wifi': 'WiFi',
  'Bus': 'Bus',
  'ShoppingBag': 'Shopping',
  'Calendar': 'Calendario',
  'Phone': 'Telefono',
  'Book': 'Libro',
  'Coffee': 'Caffè',
  'Home': 'Casa',
  'Bike': 'Bicicletta',
  'Camera': 'Fotocamera',
  'Globe': 'Mondo',
  'Mountain': 'Montagna',
  'MapPin': 'Posizione',
  'Newspaper': 'Giornale',
  'Music': 'Musica',
  'Heart': 'Cuore',
  'Trees': 'Alberi',
  'Users': 'Persone',
  'ShoppingCart': 'Carrello',
  'Car': 'Auto/Taxi',
  'Building': 'Edificio',
  'Palmtree': 'Palma',
  'UtensilsCrossed': 'Menù',
  'Bed': 'Letto',
  'Shirt': 'Abbigliamento',
  'Key': 'Chiave',
  'PawPrint': 'Animali',
  'PartyPopper': 'Festa',
  'Trophy': 'Sport',
  'Plane': 'Aereo',
  'Train': 'Treno'
};

export const PageIconSection: React.FC<PageIconSectionProps> = ({
  icon,
  setIcon
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get the icon component for the currently selected icon
  const SelectedIcon = iconComponents[icon] || FileText;
  
  // Filter icons based on search term
  const filteredIcons = searchTerm 
    ? Object.entries(iconComponents).filter(([name]) => 
        name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (iconTranslations[name] && iconTranslations[name].toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : Object.entries(iconComponents);
  
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
            <span>{iconTranslations[icon] || icon}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <div className="p-2">
            <Input 
              placeholder="Cerca icona..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
          </div>
          {filteredIcons.map(([name, Icon]) => (
            <SelectItem key={name} value={name} className="flex items-center gap-2 py-3">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <span>{iconTranslations[name] || name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

