
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Instagram, Twitter } from "lucide-react";

interface FooterProps {
  backgroundColor?: string;
  textColor?: string;
  textAlignment?: "left" | "center" | "right";
}

interface FooterSettings {
  custom_text: string;
  show_social_links: boolean;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  background_color: string;
  text_color: string;
  text_alignment: "left" | "center" | "right";
}

const defaultFooterSettings: FooterSettings = {
  custom_text: "© 2025 Powered by EV-AI Technologies",
  show_social_links: false,
  facebook_url: "",
  instagram_url: "",
  twitter_url: "",
  background_color: "bg-gradient-to-r from-teal-50 to-emerald-50",
  text_color: "#555555",
  text_alignment: "left"
};

const Footer: React.FC<FooterProps> = ({ 
  backgroundColor,
  textColor,
  textAlignment
}) => {
  const [settings, setSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        setIsLoading(true);
        
        // First try localStorage for immediate display
        let localSettings: FooterSettings | null = null;
        try {
          const savedFooterSettings = localStorage.getItem("footerSettings");
          if (savedFooterSettings) {
            localSettings = JSON.parse(savedFooterSettings);
            setSettings(localSettings);
            console.log("Using cached footer settings:", localSettings);
          }
        } catch (err) {
          console.error("Error parsing footer settings from localStorage:", err);
        }
        
        // Then try to get from database
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'footer_settings')
          .maybeSingle();

        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            console.error('Error loading footer settings:', error);
          }
          
          // If we don't have cached settings, use defaults
          if (!localSettings) {
            setSettings(defaultFooterSettings);
          }
        } else if (data && data.value) {
          const dbSettings = data.value as FooterSettings;
          console.log("Retrieved footer settings from DB:", dbSettings);
          setSettings(dbSettings);
          
          // Update localStorage with latest from DB
          try {
            localStorage.setItem("footerSettings", JSON.stringify(dbSettings));
            console.log("Updated localStorage with latest footer settings");
          } catch (e) {
            console.warn("Could not cache footer settings in localStorage:", e);
          }
        } else if (!localSettings) {
          setSettings(defaultFooterSettings);
        }
      } catch (error) {
        console.error('Error fetching footer settings:', error);
        // If we have an error and no cached settings, use defaults
        setSettings(defaultFooterSettings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFooterSettings();
  }, []);

  // Helper function to get text alignment class
  const getTextAlignClass = () => {
    // Prioritize prop over stored settings
    const alignment = textAlignment || settings.text_alignment || defaultFooterSettings.text_alignment;
    switch (alignment) {
      case "center": return "text-center";
      case "right": return "text-right";
      default: return "text-left";
    }
  };

  // Determine background color - prioritize prop over stored settings
  const bgColor = backgroundColor || settings.background_color || defaultFooterSettings.background_color;
  
  // Determine text color - prioritize prop over stored settings
  const txtColor = textColor || settings.text_color || defaultFooterSettings.text_color;

  if (isLoading) {
    return (
      <div className={`w-full ${defaultFooterSettings.background_color} py-3 border-t border-gray-200`}>
        <div className="container mx-auto px-4">
          <div className={`${getTextAlignClass()} text-gray-500 text-xs`}>
            {defaultFooterSettings.custom_text}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full py-3 border-t border-gray-200`}
      style={{ 
        backgroundColor: bgColor.startsWith('#') ? bgColor : '',
        background: !bgColor.startsWith('#') ? bgColor : ''
      }}
    >
      <div className="container mx-auto px-4">
        <div className={`flex flex-col md:flex-row ${settings.show_social_links ? 'justify-between' : 'justify-center'} items-center`}>
          <div 
            className={`${getTextAlignClass()} text-xs md:text-sm w-full`}
            style={{ color: txtColor }}
          >
            {settings.custom_text}
          </div>
          
          {settings.show_social_links && (
            <div className="flex space-x-4 mt-2 md:mt-0">
              {settings.facebook_url && (
                <a 
                  href={settings.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: txtColor }}
                  className="hover:opacity-70"
                >
                  <Facebook size={16} />
                </a>
              )}
              
              {settings.instagram_url && (
                <a 
                  href={settings.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: txtColor }}
                  className="hover:opacity-70"
                >
                  <Instagram size={16} />
                </a>
              )}
              
              {settings.twitter_url && (
                <a 
                  href={settings.twitter_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: txtColor }}
                  className="hover:opacity-70"
                >
                  <Twitter size={16} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Footer;
