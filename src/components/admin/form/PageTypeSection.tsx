
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageData } from "@/types/page.types";
import { PageType } from "@/types/form.types";
import { Input } from "@/components/ui/input";
import IconRenderer from "@/components/IconRenderer";
import {
  FileText, Image, MessageCircle, Info, Map, Utensils, Landmark, 
  Hotel, Wifi, Bus, ShoppingBag, Calendar, Phone, Book, Coffee, 
  Home, Bike, Camera, Globe, Mountain, MapPin, Newspaper, Music,
  Heart, Trees, Users, ShoppingCart, Car, Building, Palmtree,
  UtensilsCrossed, Bed, Shirt, Key, PawPrint, PartyPopper, Trophy,
  Plane, Train
} from "lucide-react";

interface PageTypeSectionProps {
  pageType: PageType;
  setPageType: (type: PageType) => void;
  parentPath: string;
  setParentPath: (path: string) => void;
  icon: string;
  setIcon: (icon: string) => void;
  parentPages: PageData[];
  control?: any;
}

const iconOptions = [
  { value: 'FileText', label: 'Documento', icon: FileText },
  { value: 'Image', label: 'Immagine', icon: Image },
  { value: 'MessageCircle', label: 'Messaggio', icon: MessageCircle },
  { value: 'Info', label: 'Informazioni', icon: Info },
  { value: 'Map', label: 'Mappa', icon: Map },
  { value: 'Utensils', label: 'Ristorante', icon: Utensils },
  { value: 'Landmark', label: 'Monumento', icon: Landmark },
  { value: 'Hotel', label: 'Hotel', icon: Hotel },
  { value: 'Wifi', label: 'WiFi', icon: Wifi },
  { value: 'Bus', label: 'Bus', icon: Bus },
  { value: 'ShoppingBag', label: 'Shopping', icon: ShoppingBag },
  { value: 'Calendar', label: 'Calendario', icon: Calendar },
  { value: 'Phone', label: 'Telefono', icon: Phone },
  { value: 'Book', label: 'Libro', icon: Book },
  { value: 'Coffee', label: 'Caffè', icon: Coffee },
  { value: 'Home', label: 'Casa', icon: Home },
  { value: 'Bike', label: 'Bicicletta', icon: Bike },
  { value: 'Camera', label: 'Fotocamera', icon: Camera },
  { value: 'Globe', label: 'Mondo', icon: Globe },
  { value: 'Mountain', label: 'Montagna', icon: Mountain },
  { value: 'MapPin', label: 'Posizione', icon: MapPin },
  { value: 'Newspaper', label: 'Giornale', icon: Newspaper },
  { value: 'Music', label: 'Musica', icon: Music },
  { value: 'Heart', label: 'Cuore', icon: Heart },
  { value: 'Trees', label: 'Alberi', icon: Trees },
  { value: 'Users', label: 'Persone', icon: Users },
  { value: 'ShoppingCart', label: 'Carrello', icon: ShoppingCart },
  { value: 'Car', label: 'Auto/Taxi', icon: Car },
  { value: 'Building', label: 'Edificio', icon: Building },
  { value: 'Palmtree', label: 'Palma', icon: Palmtree },
  { value: 'UtensilsCrossed', label: 'Menù', icon: UtensilsCrossed },
  { value: 'Bed', label: 'Letto', icon: Bed },
  { value: 'Shirt', label: 'Abbigliamento', icon: Shirt },
  { value: 'Key', label: 'Chiave', icon: Key },
  { value: 'PawPrint', label: 'Animali', icon: PawPrint },
  { value: 'PartyPopper', label: 'Festa', icon: PartyPopper },
  { value: 'Trophy', label: 'Sport', icon: Trophy },
  { value: 'Plane', label: 'Aereo', icon: Plane },
  { value: 'Train', label: 'Treno', icon: Train }
];

export const PageTypeSection: React.FC<PageTypeSectionProps> = ({
  pageType,
  setPageType,
  parentPath,
  setParentPath,
  icon,
  setIcon,
  parentPages,
  control
}) => {
  // Filter for Italian parent pages only (no language prefix and is_parent true)
  const filteredParentPages = parentPages.filter(page => {
    const isItalianPage = !page.path.startsWith('/en/') && 
                         !page.path.startsWith('/de/') && 
                         !page.path.startsWith('/fr/') && 
                         !page.path.startsWith('/es/');
    
    const isParentPage = page.is_parent === true;
    
    return isItalianPage && isParentPage;
  });

  return (
    <>
      <FormField
        control={control}
        name="pageType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo di Pagina</FormLabel>
            <Select
              onValueChange={(value) => {
                setPageType(value as PageType);
                field.onChange(value);
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="normal">Normale</SelectItem>
                <SelectItem value="submenu">Sottopagina</SelectItem>
                <SelectItem value="parent">Pagina Genitore</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="icon"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Icona</FormLabel>
            <Select
              onValueChange={(value) => {
                setIcon(value);
                field.onChange(value);
              }}
              defaultValue={field.value || icon}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un'icona">
                    {field.value && (
                      <div className="flex items-center gap-2">
                        <IconRenderer iconName={field.value} size="small" />
                        <span>{iconOptions.find(opt => opt.value === field.value)?.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {iconOptions.map((iconOption) => (
                  <SelectItem key={iconOption.value} value={iconOption.value}>
                    <div className="flex items-center gap-2">
                      <iconOption.icon className="h-4 w-4" />
                      <span>{iconOption.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Seleziona l'icona da mostrare nel menu
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {pageType === "submenu" && (
        <FormField
          control={control}
          name="parentPath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pagina Genitore</FormLabel>
              <Select
                onValueChange={(value) => {
                  setParentPath(value);
                  field.onChange(value);
                }}
                defaultValue={field.value || parentPath}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona la pagina genitore" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px] overflow-auto">
                  {filteredParentPages.length > 0 ? (
                    filteredParentPages.map((page) => (
                      <SelectItem key={page.path} value={page.path}>
                        {page.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Nessuna pagina genitore disponibile
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Seleziona una pagina genitore italiana
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {pageType === "parent" && (
        <FormField
          control={control}
          name="parentPath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Percorso della Pagina Genitore</FormLabel>
              <FormControl>
                <Input placeholder="es. /pagina-genitore" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
