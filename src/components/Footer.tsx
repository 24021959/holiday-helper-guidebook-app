
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { colorPalette, getMatchingFooterColor } from "@/utils/colorPalette";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";

interface FooterSettings {
  custom_text: string;
  show_social_links: boolean;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  background_color: string;
  text_alignment: "left" | "center" | "right";
}

const defaultFooterSettings: FooterSettings = {
  custom_text: "© 2025 Powered by EV-AI Technologies",
  show_social_links: false,
  facebook_url: "",
  instagram_url: "",
  twitter_url: "",
  background_color: colorPalette.lightGradients.tealEmerald,
  text_alignment: "left"
};

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { headerSettings } = useHeaderSettings();

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'footer_settings')
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            console.error('Error loading footer settings:', error);
          }
          // If settings not found, use defaults with matching header color
          const defaultWithMatching = {
            ...defaultFooterSettings,
            background_color: headerSettings?.headerColor 
              ? getMatchingFooterColor(headerSettings.headerColor) 
              : defaultFooterSettings.background_color
          };
          setSettings(defaultWithMatching);
        } else if (data && data.value) {
          // If we have saved footer settings but want to match with header
          const savedSettings = data.value as FooterSettings;
          setSettings({
            ...savedSettings,
            background_color: headerSettings?.headerColor 
              ? getMatchingFooterColor(headerSettings.headerColor) 
              : savedSettings.background_color
          });
        } else {
          const defaultWithMatching = {
            ...defaultFooterSettings,
            background_color: headerSettings?.headerColor 
              ? getMatchingFooterColor(headerSettings.headerColor) 
              : defaultFooterSettings.background_color
          };
          setSettings(defaultWithMatching);
        }
      } catch (error) {
        console.error('Error:', error);
        setSettings(defaultFooterSettings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFooterSettings();
  }, [headerSettings]);

  // Helper function to get text alignment class
  const getTextAlignClass = () => {
    switch (settings.text_alignment) {
      case "center": return "text-center";
      case "right": return "text-right";
      default: return "text-left";
    }
  };

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
    <div className={`w-full ${settings.background_color} py-3 border-t border-gray-200`}>
      <div className="container mx-auto px-4">
        <div className={`flex flex-col md:flex-row ${settings.show_social_links ? 'justify-between' : 'justify-center'} items-center`}>
          <div className={`${getTextAlignClass()} text-gray-500 text-xs md:text-sm w-full`}>
            {settings.custom_text}
          </div>
          
          {settings.show_social_links && (
            <div className="flex space-x-4 mt-2 md:mt-0">
              {settings.facebook_url && (
                <a 
                  href={settings.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Facebook size={16} />
                </a>
              )}
              
              {settings.instagram_url && (
                <a 
                  href={settings.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Instagram size={16} />
                </a>
              )}
              
              {settings.twitter_url && (
                <a 
                  href={settings.twitter_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
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
