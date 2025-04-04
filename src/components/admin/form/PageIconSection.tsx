
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PageIconSectionProps {
  icon: string;
  setIcon: (icon: string) => void;
}

export const PageIconSection: React.FC<PageIconSectionProps> = ({
  icon,
  setIcon
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="icon">Icona</Label>
      <Select 
        value={icon} 
        onValueChange={setIcon}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleziona un'icona" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="FileText">Documento</SelectItem>
          <SelectItem value="Image">Immagine</SelectItem>
          <SelectItem value="MessageCircle">Messaggio</SelectItem>
          <SelectItem value="Info">Informazioni</SelectItem>
          <SelectItem value="Map">Mappa</SelectItem>
          <SelectItem value="Utensils">Ristorante</SelectItem>
          <SelectItem value="Landmark">Luogo</SelectItem>
          <SelectItem value="Hotel">Hotel</SelectItem>
          <SelectItem value="Wifi">WiFi</SelectItem>
          <SelectItem value="Bus">Trasporti</SelectItem>
          <SelectItem value="ShoppingBag">Shopping</SelectItem>
          <SelectItem value="Calendar">Eventi</SelectItem>
          <SelectItem value="Phone">Contatti</SelectItem>
          <SelectItem value="Book">Guida</SelectItem>
          <SelectItem value="Coffee">Bar</SelectItem>
          <SelectItem value="Home">Casa</SelectItem>
          <SelectItem value="Bike">Attività</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
