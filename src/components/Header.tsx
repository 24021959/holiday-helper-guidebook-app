
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeaderProps {
  backgroundImage?: string;
  backgroundColor?: string;
  logoUrl?: string | null;
  logoSize?: "small" | "medium" | "large";
  logoPosition?: "left" | "center" | "right";
  establishmentName?: string | null;
  establishmentNameAlignment?: "left" | "center" | "right";
  establishmentNameColor?: string;
  showAdminButton?: boolean;
}

interface HeaderSettings {
  logo_url: string | null;
  header_color: string;
  establishment_name: string;
  establishment_name_alignment: "left" | "center" | "right";
  establishment_name_color: string;
  logo_position: "left" | "center" | "right";
  logo_size: "small" | "medium" | "large";
}

const defaultSettings: HeaderSettings = {
  logo_url: null,
  header_color: "bg-white",
  establishment_name: "Locanda dell'Angelo",
  establishment_name_alignment: "left",
  establishment_name_color: "#000000",
  logo_position: "left",
  logo_size: "medium"
};

const Header: React.FC<HeaderProps> = ({ 
  backgroundImage, 
  backgroundColor,
  logoUrl,
  logoSize,
  logoPosition,
  establishmentName,
  establishmentNameAlignment,
  establishmentNameColor,
  showAdminButton = false
}) => {
  const [localSettings, setLocalSettings] = useState<HeaderSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to get cached settings first
        const cachedSettings = localStorage.getItem("headerSettings");
        if (cachedSettings) {
          try {
            const parsed = JSON.parse(cachedSettings);
            // Convert from localStorage format to component format
            setLocalSettings({
              logo_url: parsed.logoUrl,
              header_color: parsed.headerColor,
              establishment_name: parsed.establishmentName,
              establishment_name_alignment: parsed.establishmentNameAlignment,
              establishment_name_color: parsed.establishmentNameColor,
              logo_position: parsed.logoPosition,
              logo_size: parsed.logoSize
            });
            console.log("Using cached header settings:", parsed);
          } catch (e) {
            console.error("Error parsing header settings:", e);
          }
        }
        
        // Try to get settings from database
        const { data, error } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .maybeSingle();
          
        if (error) {
          console.warn("Could not load header settings from DB:", error);
        } else if (data) {
          setLocalSettings(data);
          console.log("Loaded header settings from DB:", data);
          
          // Update cache
          try {
            localStorage.setItem("headerSettings", JSON.stringify({
              logoUrl: data.logo_url,
              headerColor: data.header_color,
              establishmentName: data.establishment_name,
              logoPosition: data.logo_position,
              logoSize: data.logo_size,
              establishmentNameAlignment: data.establishment_name_alignment,
              establishmentNameColor: data.establishment_name_color
            }));
          } catch (e) {
            console.warn("Could not cache header settings:", e);
          }
        }
      } catch (e) {
        console.error("Error loading header settings:", e);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Determine which settings to use (props take precedence, followed by DB settings, then defaults)
  const effectiveLogoUrl = logoUrl ?? localSettings?.logo_url ?? defaultSettings.logo_url;
  const effectiveLogoSize = logoSize ?? localSettings?.logo_size ?? defaultSettings.logo_size;
  const effectiveLogoPosition = logoPosition ?? localSettings?.logo_position ?? defaultSettings.logo_position;
  const effectiveEstablishmentName = establishmentName ?? localSettings?.establishment_name ?? defaultSettings.establishment_name;
  const effectiveEstablishmentNameAlignment = establishmentNameAlignment ?? localSettings?.establishment_name_alignment ?? defaultSettings.establishment_name_alignment;
  const effectiveEstablishmentNameColor = establishmentNameColor ?? localSettings?.establishment_name_color ?? defaultSettings.establishment_name_color;
  const effectiveBackgroundColor = backgroundColor ?? localSettings?.header_color ?? defaultSettings.header_color;

  // Calculate logo size
  const logoSizeClass = {
    small: "h-12 md:h-14",
    medium: "h-16 md:h-20",
    large: "h-20 md:h-24"
  }[effectiveLogoSize || "medium"];

  // Determine layout based on logo position
  const layoutClass = {
    left: "sm:flex-row sm:justify-between",
    center: "flex-col items-center",
    right: "sm:flex-row-reverse sm:justify-between"
  }[effectiveLogoPosition || "left"];

  // Additional margin for centered layout (logo above, name below)
  const nameMarginClass = (effectiveLogoPosition === "center" && effectiveLogoUrl) ? "mt-2" : "mt-0";

  const getTextAlignmentClass = () => {
    switch (effectiveEstablishmentNameAlignment) {
      case "center": return "text-center";
      case "right": return "text-right";
      default: return "text-left";
    }
  };

  // Show a basic loading state if still loading
  if (loading) {
    return (
      <div className="w-full py-5 px-4 shadow-md rounded-xl bg-white">
        <div className="animate-pulse flex items-center justify-between">
          <div className="h-16 w-32 bg-gray-200 rounded"></div>
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full py-5 px-4 shadow-md relative overflow-hidden rounded-xl`}
      style={{
        ...(backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { backgroundColor: effectiveBackgroundColor?.startsWith('#') ? effectiveBackgroundColor : undefined })
      }}
    >
      {effectiveBackgroundColor !== "bg-white" && effectiveBackgroundColor !== "#FFFFFF" && !effectiveBackgroundColor?.startsWith('#') && (
        <div className={`absolute inset-0 ${effectiveBackgroundColor}`}></div>
      )}
      
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-white"></div>
        <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full bg-white"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-white"></div>
      </div>
      
      <div className={`relative z-10 flex ${layoutClass}`}>
        {effectiveLogoUrl && (
          <div className="flex-shrink-0 mb-2 sm:mb-0">
            <img 
              src={effectiveLogoUrl} 
              alt="Logo" 
              className={`${logoSizeClass} object-contain`} 
            />
          </div>
        )}
        
        {effectiveEstablishmentName && (
          <div className={`${nameMarginClass} w-full`}>
            <h1 
              className={`text-xl md:text-2xl font-bold ${getTextAlignmentClass()}`}
              style={{ color: effectiveEstablishmentNameColor || '#000000' }}
            >
              {effectiveEstablishmentName}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
