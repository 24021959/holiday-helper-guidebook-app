
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { saveHeaderSettings, fetchHeaderSettings, HeaderData } from "./layout/useHeaderSettings";
import { saveFooterSettings, fetchFooterSettings, FooterData } from "./layout/useFooterSettings";
import { useColorPreview } from "./layout/useColorPreview";

export interface LayoutSettingsForm {
  logoUrl: string;
  footerText: string;
  showSocialLinks: boolean;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  themeColor: string;
  headerColor: string;
  footerColor: string;
  footerTextColor: string;
  footerTextAlignment: "left" | "center" | "right";
  establishmentName: string;
  establishmentNameAlignment: "left" | "center" | "right";
  establishmentNameColor: string;
  logoPosition: "left" | "center" | "right";
  logoSize: "small" | "medium" | "large";
}

export const useLayoutSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const form = useForm<LayoutSettingsForm>({
    defaultValues: {
      logoUrl: '',
      establishmentName: '',
      logoPosition: 'left',
      logoSize: 'medium',
      themeColor: '#FFFFFF',
      headerColor: '#FFFFFF',
      footerColor: '#FFFFFF',
      footerTextColor: '#555555',
      establishmentNameColor: '#000000',
      footerText: '',
      showSocialLinks: false,
      facebookUrl: '',
      instagramUrl: '',
      twitterUrl: '',
      footerTextAlignment: 'left',
      establishmentNameAlignment: 'left'
    }
  });

  // Load settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        console.log("Loading layout settings...");
        
        // Try to load settings from localStorage first as a fallback
        let headerData = null;
        let footerData = null;
        
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
        
        // Then try to load from database (this will override local cache if successful)
        try {
          const [dbHeaderData, dbFooterData] = await Promise.all([
            fetchHeaderSettings(),
            fetchFooterSettings()
          ]);
          
          if (dbHeaderData) {
            headerData = {
              logoUrl: dbHeaderData.logo_url,
              establishmentName: dbHeaderData.establishment_name,
              logoPosition: dbHeaderData.logo_position,
              logoSize: dbHeaderData.logo_size,
              headerColor: dbHeaderData.header_color,
              establishmentNameColor: dbHeaderData.establishment_name_color,
              establishmentNameAlignment: dbHeaderData.establishment_name_alignment
            };
          }
          
          if (dbFooterData) {
            footerData = dbFooterData;
          }
        } catch (error) {
          console.error("Error loading settings from database:", error);
          // We'll continue with localStorage data if available
          if (!headerData && !footerData) {
            throw error; // Only throw if we have no data at all
          }
        }
        
        console.log("Final header data for form:", headerData);
        console.log("Final footer data for form:", footerData);

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
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [form]);

  // Get color preview values
  const colorPreview = useColorPreview(form.watch);

  // Save settings
  const onSubmit = async (data: LayoutSettingsForm) => {
    console.log("Submitting layout settings:", data);
    setIsLoading(true);
    setIsSuccess(false);
    
    try {
      toast.info("Salvataggio impostazioni in corso...");
      
      // Prepare header data
      const headerData: HeaderData = {
        logo_url: data.logoUrl,
        header_color: data.headerColor,
        establishment_name: data.establishmentName,
        establishment_name_alignment: data.establishmentNameAlignment,
        establishment_name_color: data.establishmentNameColor,
        logo_position: data.logoPosition,
        logo_size: data.logoSize
      };
      
      // Prepare footer data
      const footerData: FooterData = {
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
      
      // Use Promise.all to save both settings concurrently
      const [headerResult, footerResult] = await Promise.all([
        saveHeaderSettings(headerData),
        saveFooterSettings(footerData)
      ]);
      
      console.log("Header settings saved:", headerResult);
      console.log("Footer settings saved:", footerResult);

      if (!headerResult && !footerResult) {
        throw new Error("Nessun dato è stato salvato");
      }

      // Also update local cache for immediate access
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
    form,
    formLoaded,
    loadError,
    isLoading,
    isSuccess,
    onSubmit,
    ...colorPreview
  };
};
