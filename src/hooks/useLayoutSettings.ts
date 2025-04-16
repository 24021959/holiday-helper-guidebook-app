
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { saveHeaderSettings, fetchHeaderSettings } from "./layout/useHeaderSettings";
import { saveFooterSettings, fetchFooterSettings } from "./layout/useFooterSettings";
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

  const form = useForm<LayoutSettingsForm>({
    defaultValues: async () => {
      try {
        const headerData = await fetchHeaderSettings();
        const footerData = await fetchFooterSettings();

        console.log("Loaded header data:", headerData);
        console.log("Loaded footer data:", footerData);

        return {
          logoUrl: headerData?.logo_url || '',
          establishmentName: headerData?.establishment_name || '',
          logoPosition: headerData?.logo_position || 'left',
          logoSize: headerData?.logo_size || 'medium',
          themeColor: headerData?.header_color || '#FFFFFF',
          headerColor: headerData?.header_color || '#FFFFFF',
          footerColor: footerData?.background_color || '#FFFFFF',
          footerTextColor: footerData?.text_color || '#555555',
          establishmentNameColor: headerData?.establishment_name_color || '#000000',
          footerText: footerData?.custom_text || '',
          showSocialLinks: footerData?.show_social_links || false,
          facebookUrl: footerData?.facebook_url || '',
          instagramUrl: footerData?.instagram_url || '',
          twitterUrl: footerData?.twitter_url || '',
          footerTextAlignment: footerData?.text_alignment || 'left',
          establishmentNameAlignment: headerData?.establishment_name_alignment || 'left'
        };
      } catch (error) {
        console.error("Error loading layout settings:", error);
        toast.error("Errore nel caricamento delle impostazioni");
        return {
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
        };
      }
    }
  });

  const colorPreview = useColorPreview(form.watch);

  const onSubmit = async (data: LayoutSettingsForm) => {
    console.log("Submitting layout settings:", data);
    setIsLoading(true);
    try {
      // Save header settings
      const headerResult = await saveHeaderSettings({
        logo_url: data.logoUrl,
        header_color: data.headerColor,
        establishment_name: data.establishmentName,
        establishment_name_alignment: data.establishmentNameAlignment,
        establishment_name_color: data.establishmentNameColor,
        logo_position: data.logoPosition,
        logo_size: data.logoSize
      });
      
      console.log("Header settings saved:", headerResult);
      
      // Save footer settings
      const footerResult = await saveFooterSettings({
        custom_text: data.footerText,
        show_social_links: data.showSocialLinks,
        facebook_url: data.facebookUrl,
        instagram_url: data.instagramUrl,
        twitter_url: data.twitterUrl,
        background_color: data.footerColor,
        text_color: data.footerTextColor,
        text_alignment: data.footerTextAlignment
      });
      
      console.log("Footer settings saved:", footerResult);

      setIsSuccess(true);
      toast.success("Impostazioni layout salvate con successo");
    } catch (error) {
      console.error("Error saving layout settings:", error);
      toast.error("Errore nel salvataggio delle impostazioni");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isSuccess,
    onSubmit,
    ...colorPreview
  };
};
