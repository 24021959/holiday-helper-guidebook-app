
import { useState } from 'react';
import { toast } from "sonner";
import { saveHeaderSettings } from './useHeaderSettings';
import { saveFooterSettings } from './useFooterSettings';
import type { LayoutSettingsForm } from './useLayoutForm';

export const useLayoutSave = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [saveAttempt, setSaveAttempt] = useState(0);

  const onSubmit = async (data: LayoutSettingsForm) => {
    console.log("Submitting layout settings:", data);
    setIsLoading(true);
    setIsSuccess(false);
    setSaveAttempt(prev => prev + 1);
    
    try {
      toast.info("Salvataggio impostazioni in corso...");
      
      const headerData = {
        logo_url: data.logoUrl,
        header_color: data.headerColor,
        establishment_name: data.establishmentName,
        establishment_name_alignment: data.establishmentNameAlignment,
        establishment_name_color: data.establishmentNameColor,
        logo_position: data.logoPosition,
        logo_size: data.logoSize
      };
      
      const footerData = {
        custom_text: data.footerText,
        show_social_links: data.showSocialLinks,
        facebook_url: data.facebookUrl,
        instagram_url: data.instagramUrl,
        twitter_url: data.twitterUrl,
        background_color: data.footerColor,
        text_color: data.footerTextColor,
        text_alignment: data.footerTextAlignment
      };
      
      console.log("Saving header data:", headerData);
      console.log("Saving footer data:", footerData);
      
      const results = await Promise.allSettled([
        saveHeaderSettings(headerData),
        saveFooterSettings(footerData)
      ]);
      
      const headerResult = results[0];
      const footerResult = results[1];
      
      if (headerResult.status === 'rejected') {
        console.error("Error saving header settings:", headerResult.reason);
        toast.error("Errore nel salvataggio delle impostazioni header");
        return;
      }
      
      if (footerResult.status === 'rejected') {
        console.error("Error saving footer settings:", footerResult.reason);
        toast.error("Errore nel salvataggio delle impostazioni footer");
        return;
      }
      
      console.log("Header settings saved:", headerResult.status === 'fulfilled' ? headerResult.value : 'N/A');
      console.log("Footer settings saved:", footerResult.status === 'fulfilled' ? footerResult.value : 'N/A');

      try {
        localStorage.setItem("headerSettings", JSON.stringify({
          logoUrl: data.logoUrl,
          establishmentName: data.establishmentName,
          logoPosition: data.logoPosition,
          logoSize: data.logoSize,
          headerColor: data.headerColor,
          establishmentNameColor: data.establishmentNameColor,
          establishmentNameAlignment: data.establishmentNameAlignment
        }));
        
        localStorage.setItem("footerSettings", JSON.stringify(footerData));
        console.log("Settings cached in localStorage");
      } catch (e) {
        console.warn("Could not cache settings in localStorage:", e);
      }

      setIsSuccess(true);
      toast.success("Impostazioni layout salvate con successo");
    } catch (error) {
      console.error("Error saving layout settings:", error);
      toast.error("Errore nel salvataggio delle impostazioni");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isSuccess,
    saveAttempt,
    onSubmit
  };
};

