import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ImageUploader from "@/components/ImageUploader";
import Header from "@/components/Header";

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
    { value: "bg-gradient-to-r from-teal-500 to-emerald-600", label: "Teal/Emerald (Default)" },
    { value: "bg-gradient-to-r from-blue-500 to-indigo-600", label: "Blue/Indigo" },
    { value: "bg-gradient-to-r from-purple-500 to-pink-500", label: "Purple/Pink" },
    { value: "bg-gradient-to-r from-red-500 to-orange-500", label: "Red/Orange" },
    { value: "bg-gradient-to-r from-amber-400 to-yellow-500", label: "Amber/Yellow" },
    { value: "bg-white", label: "White" },
    { value: "bg-gray-800", label: "Dark Gray" },
    { value: "bg-black", label: "Black" }
  ];
  
  const handleLogoUpload = async (imageDataUrl: string) => {
    setUploadedLogo(imageDataUrl);
    
    try {
      const { data: existingData, error: fetchError } = await supabase
        .from('header_settings')
        .select('*')
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      let saveOperation;
      if (existingData && existingData.length > 0) {
        saveOperation = supabase
          .from('header_settings')
          .update({ logo_url: imageDataUrl })
          .eq('id', existingData[0].id);
      } else {
        saveOperation = supabase
          .from('header_settings')
          .insert({ logo_url: imageDataUrl, header_color: headerColor });
      }
      
      const { error: saveError } = await saveOperation;
      if (saveError) throw saveError;
      
      const headerSettings = {
        logoUrl: imageDataUrl,
        headerColor: headerColor
      };
      localStorage.setItem("headerSettings", JSON.stringify(headerSettings));
      
      toast.success("Logo caricato con successo");
    } catch (error) {
      console.error("Errore nel salvare il logo:", error);
      toast.error("Errore nel salvare il logo");
    }
  };

  const handleHeaderColorChange = async (color: string) => {
    setHeaderColor(color);
    
    try {
      const { data: existingData, error: fetchError } = await supabase
        .from('header_settings')
        .select('*')
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      let saveOperation;
      if (existingData && existingData.length > 0) {
        saveOperation = supabase
          .from('header_settings')
          .update({ header_color: color })
          .eq('id', existingData[0].id);
      } else {
        saveOperation = supabase
          .from('header_settings')
          .insert({ logo_url: uploadedLogo, header_color: color });
      }
      
      const { error: saveError } = await saveOperation;
      if (saveError) throw saveError;
      
      const headerSettings = {
        logoUrl: uploadedLogo,
        headerColor: color
      };
      localStorage.setItem("headerSettings", JSON.stringify(headerSettings));
      
      toast.success("Colore dell'header aggiornato");
    } catch (error) {
      console.error("Errore nel salvare il colore dell'header:", error);
      toast.error("Errore nel salvare il colore dell'header");
    }
  };

  return (
    <>
      <h2 className="text-xl font-medium text-emerald-600 mb-4">Personalizza Header</h2>
      
      <div className="space-y-6">
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-md font-medium text-emerald-700 mb-4">Logo della struttura</h3>
          <ImageUploader onImageUpload={handleLogoUpload} />
          
          {uploadedLogo && (
            <div className="mt-4 relative">
              <div className="p-4 bg-gray-100 rounded-md inline-block">
                <img 
                  src={uploadedLogo} 
                  alt="Logo Anteprima" 
                  className="h-16 object-contain" 
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={async () => {
                  try {
                    const { data: existingData } = await supabase
                      .from('header_settings')
                      .select('*')
                      .limit(1);
                    
                    if (existingData && existingData.length > 0) {
                      await supabase
                        .from('header_settings')
                        .update({ logo_url: null })
                        .eq('id', existingData[0].id);
                    }
                    
                    setUploadedLogo(null);
                    
                    const headerSettings = {
                      logoUrl: null,
                      headerColor: headerColor
                    };
                    localStorage.setItem("headerSettings", JSON.stringify(headerSettings));
                    
                    toast.info("Logo rimosso");
                  } catch (error) {
                    console.error("Errore nella rimozione del logo:", error);
                    toast.error("Errore nella rimozione del logo");
                  }
                }}
              >
                Rimuovi Logo
              </Button>
            </div>
          )}
        </div>
        
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-md font-medium text-emerald-700 mb-4">Colore dell'header</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {headerColorOptions.map((option) => (
              <div 
                key={option.value}
                className={`cursor-pointer rounded-lg transition-all ${
                  headerColor === option.value ? 'ring-2 ring-emerald-500' : ''
                }`}
                onClick={() => handleHeaderColorChange(option.value)}
              >
                <div 
                  className={`${option.value} h-16 rounded-lg flex items-center justify-center ${
                    option.value === "bg-white" ? "border" : ""
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    option.value === "bg-white" || option.value === "bg-gradient-to-r from-amber-400 to-yellow-500" 
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
              backgroundColor={headerColor} 
              logoUrl={uploadedLogo || undefined}
            />
          </div>
        </div>
      </div>
    </>
  );
};
