import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import ImageUploader from "@/components/ImageUploader";
import Header from "@/components/Header";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { colorPalette } from "@/utils/colorPalette";

interface HeaderSettingsViewProps {
  uploadedLogo: string | null;
  setUploadedLogo: (logo: string | null) => void;
  headerColor: string;
  setHeaderColor: (color: string) => void;
}

export const HeaderSettingsView: React.FC<HeaderSettingsViewProps> = ({ 
  uploadedLogo, 
  setUploadedLogo, 
  headerColor, 
  setHeaderColor 
}) => {
  const headerColorOptions = [
    { value: colorPalette.gradients.tealEmerald, label: "Teal/Emerald (Default)" },
    { value: colorPalette.gradients.blueIndigo, label: "Blue/Indigo" },
    { value: colorPalette.gradients.purplePink, label: "Purple/Pink" },
    { value: colorPalette.gradients.redOrange, label: "Red/Orange" },
    { value: colorPalette.gradients.amberYellow, label: "Amber/Yellow" },
    { value: colorPalette.solid.white, label: "White" },
    { value: colorPalette.solid.grayDark, label: "Dark Gray" },
    { value: colorPalette.solid.black, label: "Black" },
    { value: colorPalette.gradients.purpleIndigo, label: "Purple/Indigo" }
  ];
  
  const [establishmentName, setEstablishmentName] = useState<string>("");
  const [localLogo, setLocalLogo] = useState<string | null>(uploadedLogo);
  const [localColor, setLocalColor] = useState<string>(headerColor);
  const [logoPosition, setLogoPosition] = useState<"left" | "center" | "right">("left");
  const [logoSize, setLogoSize] = useState<"small" | "medium" | "large">("medium");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchHeaderSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          if (data[0].establishment_name) {
            setEstablishmentName(data[0].establishment_name);
          }
          if (data[0].logo_url) {
            setLocalLogo(data[0].logo_url);
            setUploadedLogo(data[0].logo_url);
          }
          if (data[0].header_color) {
            setLocalColor(data[0].header_color);
            setHeaderColor(data[0].header_color);
          }
          if (data[0].logo_position) {
            setLogoPosition(data[0].logo_position);
          }
          if (data[0].logo_size) {
            setLogoSize(data[0].logo_size);
          }
        }
      } catch (error) {
        console.error("Error fetching header settings:", error);
      }
    };
    
    fetchHeaderSettings();
  }, [setUploadedLogo, setHeaderColor]);

  const handleLogoUpload = (imageDataUrl: string) => {
    setLocalLogo(imageDataUrl);
  };

  const handleHeaderColorChange = (color: string) => {
    setLocalColor(color);
  };

  const handleRemoveLogo = () => {
    setLocalLogo(null);
  };

  const saveAllSettings = async () => {
    setIsLoading(true);
    try {
      const { data: existingData, error: fetchError } = await supabase
        .from('header_settings')
        .select('*')
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      const headerData = { 
        logo_url: localLogo, 
        header_color: localColor,
        establishment_name: establishmentName || null,
        logo_position: logoPosition,
        logo_size: logoSize
      };
      
      console.log("Saving header settings:", headerData);
      
      let saveOperation;
      if (existingData && existingData.length > 0) {
        saveOperation = supabase
          .from('header_settings')
          .update(headerData)
          .eq('id', existingData[0].id);
      } else {
        saveOperation = supabase
          .from('header_settings')
          .insert(headerData);
      }
      
      const { error: saveError } = await saveOperation;
      if (saveError) throw saveError;
      
      setUploadedLogo(localLogo);
      setHeaderColor(localColor);
      
      const headerSettings = {
        logoUrl: localLogo,
        headerColor: localColor,
        establishmentName: establishmentName || null,
        logoPosition: logoPosition,
        logoSize: logoSize
      };
      localStorage.setItem("headerSettings", JSON.stringify(headerSettings));
      
      toast.success("Impostazioni header salvate con successo");
    } catch (error) {
      console.error("Errore nel salvare le impostazioni dell'header:", error);
      toast.error("Errore nel salvare le impostazioni dell'header");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-medium text-emerald-600 mb-4">Personalizza Header</h2>
      
      <div className="space-y-6">
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-md font-medium text-emerald-700 mb-4">Nome della struttura</h3>
          <Input
            type="text"
            placeholder="Inserisci il nome della struttura"
            value={establishmentName}
            onChange={(e) => setEstablishmentName(e.target.value)}
            className="flex-grow"
          />
          <p className="text-xs text-gray-500 mt-2">Lascia vuoto per non mostrare alcun testo nell'header</p>
        </div>
        
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-md font-medium text-emerald-700 mb-4">Logo della struttura</h3>
          <ImageUploader onImageUpload={handleLogoUpload} />
          
          {localLogo && (
            <div className="mt-4 relative">
              <div className="p-4 bg-gray-100 rounded-md inline-block">
                <img 
                  src={localLogo} 
                  alt="Logo Anteprima" 
                  className="h-16 object-contain" 
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveLogo}
              >
                Rimuovi Logo
              </Button>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">Inserisci un logo o rimuovilo per non mostrarlo nell'header</p>
        </div>
        
        {localLogo && (
          <>
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="text-md font-medium text-emerald-700 mb-4">Posizione del logo</h3>
              <RadioGroup 
                value={logoPosition} 
                onValueChange={(value) => setLogoPosition(value as "left" | "center" | "right")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="left" id="logo-left" />
                  <Label htmlFor="logo-left">Sinistra</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="center" id="logo-center" />
                  <Label htmlFor="logo-center">Centro (Logo sopra, Testo sotto)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="right" id="logo-right" />
                  <Label htmlFor="logo-right">Destra</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="text-md font-medium text-emerald-700 mb-4">Dimensione del logo</h3>
              <RadioGroup 
                value={logoSize} 
                onValueChange={(value) => setLogoSize(value as "small" | "medium" | "large")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="logo-small" />
                  <Label htmlFor="logo-small">Piccolo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="logo-medium" />
                  <Label htmlFor="logo-medium">Medio (Default)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="logo-large" />
                  <Label htmlFor="logo-large">Grande</Label>
                </div>
              </RadioGroup>
            </div>
          </>
        )}
        
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-md font-medium text-emerald-700 mb-4">Colore dell'header</h3>
          <p className="text-xs text-gray-500 mb-4">Il colore del footer verrà automaticamente abbinato al colore dell'header</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {headerColorOptions.map((option) => (
              <div 
                key={option.value}
                className={`cursor-pointer rounded-lg transition-all ${
                  localColor === option.value ? 'ring-2 ring-emerald-500' : ''
                }`}
                onClick={() => handleHeaderColorChange(option.value)}
              >
                <div 
                  className={`${option.value} h-16 rounded-lg flex items-center justify-center ${
                    option.value === colorPalette.solid.white ? "border" : ""
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    option.value === colorPalette.solid.white || option.value === colorPalette.gradients.amberYellow 
                      ? "text-gray-800" 
                      : "text-white"
                  }`}>
                    {option.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="text-md font-medium text-emerald-700 mb-4">Anteprima Header</h3>
          <div className="border rounded-lg overflow-hidden">
            <Header 
              backgroundColor={localColor} 
              logoUrl={localLogo || undefined}
              logoPosition={logoPosition}
              logoSize={logoSize}
              showAdminButton={false}
              establishmentName={establishmentName || undefined}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
            onClick={saveAllSettings}
            disabled={isLoading}
          >
            {isLoading ? "Salvataggio..." : "Salva impostazioni header"}
          </Button>
        </div>
      </div>
    </>
  );
};
