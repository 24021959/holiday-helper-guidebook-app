import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HeaderLogo from "./header/HeaderLogo";
import EstablishmentName from "./header/EstablishmentName";

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
        const cachedSettings = localStorage.getItem("headerSettings");
        if (cachedSettings) {
          try {
            const parsed = JSON.parse(cachedSettings);
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
  
  const effectiveLogoUrl = logoUrl ?? localSettings?.logo_url ?? defaultSettings.logo_url;
  const effectiveLogoSize = logoSize ?? localSettings?.logo_size ?? defaultSettings.logo_size;
  const effectiveLogoPosition = logoPosition ?? localSettings?.logo_position ?? defaultSettings.logo_position;
  const effectiveEstablishmentName = establishmentName ?? localSettings?.establishment_name ?? defaultSettings.establishment_name;
  const effectiveEstablishmentNameAlignment = establishmentNameAlignment ?? localSettings?.establishment_name_alignment ?? defaultSettings.establishment_name_alignment;
  const effectiveEstablishmentNameColor = establishmentNameColor ?? localSettings?.establishment_name_color ?? defaultSettings.establishment_name_color;
  const effectiveBackgroundColor = backgroundColor ?? localSettings?.header_color ?? defaultSettings.header_color;

  const layoutClass = {
    left: "sm:flex-row sm:justify-between",
    center: "flex-col items-center",
    right: "sm:flex-row-reverse sm:justify-between"
  }[effectiveLogoPosition || "left"];

  const nameMarginClass = (effectiveLogoPosition === "center" && effectiveLogoUrl) ? "mt-2" : "mt-0";

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
      className="w-full py-5 px-4 shadow-md relative overflow-hidden rounded-xl"
      style={{
        ...(backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { backgroundColor: effectiveBackgroundColor?.startsWith('#') ? effectiveBackgroundColor : undefined })
      }}
    >
      <div className={`relative z-10 flex ${layoutClass}`}>
        <HeaderLogo 
          logoUrl={effectiveLogoUrl}
          logoSize={effectiveLogoSize}
        />
        
        <EstablishmentName 
          name={effectiveEstablishmentName || ''}
          alignment={effectiveEstablishmentNameAlignment}
          color={effectiveEstablishmentNameColor}
          className={nameMarginClass}
        />
      </div>
    </div>
  );
};

export default Header;
