
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { fetchHeaderSettings } from './useHeaderSettings';
import { fetchFooterSettings } from './useFooterSettings';
import type { UseFormReturn } from 'react-hook-form';
import type { LayoutSettingsForm } from './useLayoutForm';

export const useLayoutDataLoad = (form: UseFormReturn<LayoutSettingsForm>) => {
  const [formLoaded, setFormLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log("Loading layout settings...");
        setLoadError(null);
        
        let headerData = null;
        let footerData = null;
        
        // Try to load from localStorage first
        try {
          const cachedHeaderSettings = localStorage.getItem("headerSettings");
          if (cachedHeaderSettings) {
            headerData = JSON.parse(cachedHeaderSettings);
            console.log("Found cached header settings:", headerData);
          }
          
          const cachedFooterSettings = localStorage.getItem("footerSettings");
          if (cachedFooterSettings) {
            footerData = JSON.parse(cachedFooterSettings);
            console.log("Found cached footer settings:", footerData);
          }
        } catch (e) {
          console.warn("Error reading from localStorage:", e);
        }
        
        // Then try to fetch from database
        try {
          const [dbHeaderData, dbFooterData] = await Promise.all([
            fetchHeaderSettings(),
            fetchFooterSettings()
          ]);
          
          if (dbHeaderData) {
            headerData = {
              logoUrl: dbHeaderData.logo_url || '',
              establishmentName: dbHeaderData.establishment_name || '',
              logoPosition: dbHeaderData.logo_position || 'left',
              logoSize: dbHeaderData.logo_size || 'medium',
              headerColor: dbHeaderData.header_color || '#FFFFFF',
              establishmentNameColor: dbHeaderData.establishment_name_color || '#000000',
              establishmentNameAlignment: dbHeaderData.establishment_name_alignment || 'left'
            };
            console.log("Found header settings in database:", headerData);
          }
          
          if (dbFooterData) {
            footerData = dbFooterData;
            console.log("Found footer settings in database:", footerData);
          }
        } catch (error) {
          console.error("Error loading settings from database:", error);
          if (!headerData && !footerData) {
            throw error;
          }
        }

        const formValues = {
          logoUrl: headerData?.logoUrl || '',
          establishmentName: headerData?.establishmentName || '',
          logoPosition: headerData?.logoPosition || 'left',
          logoSize: headerData?.logoSize || 'medium',
          themeColor: headerData?.headerColor || '#FFFFFF',
          headerColor: headerData?.headerColor || '#FFFFFF',
          footerColor: footerData?.background_color || '#FFFFFF',
          footerTextColor: footerData?.text_color || '#555555',
          establishmentNameColor: headerData?.establishmentNameColor || '#000000',
          footerText: footerData?.custom_text || '',
          showSocialLinks: footerData?.show_social_links || false,
          facebookUrl: footerData?.facebook_url || '',
          instagramUrl: footerData?.instagram_url || '',
          twitterUrl: footerData?.twitter_url || '',
          footerTextAlignment: footerData?.text_alignment || 'left',
          establishmentNameAlignment: headerData?.establishmentNameAlignment || 'left'
        };

        console.log("Setting form values:", formValues);
        form.reset(formValues);
        setFormLoaded(true);
      } catch (error) {
        console.error("Error loading layout settings:", error);
        setLoadError("Errore nel caricamento delle impostazioni. Riprova più tardi.");
        toast.error("Errore nel caricamento delle impostazioni");
      }
    };

    loadSettings();
  }, [form]);

  return { formLoaded, loadError };
};

