
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

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
  footerTextAlignment: "left" | "center" | "right";
  establishmentName: string;
  establishmentNameAlignment: "left" | "center" | "right";
  establishmentNameColor: string;
  logoPosition: "left" | "center" | "right";
  logoSize: "small" | "medium" | "large";
}

export const useLayoutSettings = () => {
  const [previewHeaderColor, setPreviewHeaderColor] = useState("#FFFFFF");
  const [previewFooterColor, setPreviewFooterColor] = useState("#FFFFFF");
  const [previewEstablishmentNameColor, setPreviewEstablishmentNameColor] = useState("#000000");

  const form = useForm<LayoutSettingsForm>({
    defaultValues: async () => {
      const [headerResult, footerResult] = await Promise.all([
        supabase.from('header_settings').select('*').single(),
        supabase.from('site_settings').select('*').eq('key', 'footer_settings').single()
      ]);

      const headerData = headerResult.data || {};
      const footerData = footerResult.data?.value || {};

      const initialHeaderColor = headerData.header_color || '#FFFFFF';
      const initialFooterColor = footerData.background_color || '#FFFFFF';
      const initialNameColor = headerData.establishment_name_color || '#000000';
      
      setPreviewHeaderColor(initialHeaderColor);
      setPreviewFooterColor(initialFooterColor);
      setPreviewEstablishmentNameColor(initialNameColor);

      return {
        logoUrl: headerData.logo_url || '',
        establishmentName: headerData.establishment_name || '',
        logoPosition: headerData.logo_position || 'left',
        logoSize: headerData.logo_size || 'medium',
        themeColor: initialHeaderColor,
        headerColor: initialHeaderColor,
        footerColor: initialFooterColor,
        establishmentNameColor: initialNameColor,
        footerText: footerData.custom_text || '',
        showSocialLinks: footerData.show_social_links || false,
        facebookUrl: footerData.facebook_url || '',
        instagramUrl: footerData.instagram_url || '',
        twitterUrl: footerData.twitter_url || '',
        footerTextAlignment: footerData.text_alignment || 'left',
        establishmentNameAlignment: headerData.establishment_name_alignment || 'left'
      };
    }
  });

  useEffect(() => {
    setPreviewHeaderColor(form.watch('headerColor'));
    setPreviewFooterColor(form.watch('footerColor'));
    setPreviewEstablishmentNameColor(form.watch('establishmentNameColor'));
  }, [
    form.watch('headerColor'),
    form.watch('footerColor'),
    form.watch('establishmentNameColor')
  ]);

  const onSubmit = async (data: LayoutSettingsForm) => {
    try {
      const { error: headerError } = await supabase
        .from('header_settings')
        .upsert({
          logo_url: data.logoUrl,
          header_color: data.headerColor,
          establishment_name: data.establishmentName,
          establishment_name_alignment: data.establishmentNameAlignment,
          establishment_name_color: data.establishmentNameColor,
          logo_position: data.logoPosition,
          logo_size: data.logoSize
        });

      if (headerError) throw headerError;

      const { error: footerError } = await supabase
        .from('site_settings')
        .upsert({
          key: 'footer_settings',
          value: {
            custom_text: data.footerText,
            show_social_links: data.showSocialLinks,
            facebook_url: data.facebookUrl,
            instagram_url: data.instagramUrl,
            twitter_url: data.twitterUrl,
            background_color: data.footerColor,
            text_alignment: data.footerTextAlignment
          }
        });

      if (footerError) throw footerError;

      toast.success("Impostazioni layout salvate con successo");
    } catch (error) {
      console.error("Error saving layout settings:", error);
      toast.error("Errore nel salvataggio delle impostazioni");
    }
  };

  return {
    form,
    previewHeaderColor,
    previewFooterColor,
    previewEstablishmentNameColor,
    onSubmit
  };
};
