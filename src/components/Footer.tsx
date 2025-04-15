import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Instagram, Twitter } from "lucide-react";

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
  background_color: "bg-gradient-to-r from-teal-50 to-emerald-50",
  text_alignment: "left"
};

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [isLoading, setIsLoading] = useState(true);

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
          // If settings not found, use defaults
          setSettings(defaultFooterSettings);
        } else if (data && data.value) {
          setSettings(data.value as FooterSettings);
        } else {
          setSettings(defaultFooterSettings);
        }
      } catch (error) {
        console.error('Error:', error);
        setSettings(defaultFooterSettings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFooterSettings();
  }, []);

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
