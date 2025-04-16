
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
  footerTextColor: string;
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
  const [previewFooterTextColor, setPreviewFooterTextColor] = useState("#555555");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LayoutSettingsForm>({
    defaultValues: async () => {
      try {
        const [headerResult, footerResult] = await Promise.all([
          supabase.from('header_settings').select('*').maybeSingle(),
          supabase.from('site_settings').select('*').eq('key', 'footer_settings').maybeSingle()
        ]);

        const headerData = headerResult.data || {};
        const footerData = footerResult.data?.value || {};

        const initialHeaderColor = headerData.header_color || '#FFFFFF';
        const initialFooterColor = footerData.background_color || '#FFFFFF';
        const initialNameColor = headerData.establishment_name_color || '#000000';
        const initialFooterTextColor = footerData.text_color || '#555555';
        
        setPreviewHeaderColor(initialHeaderColor);
        setPreviewFooterColor(initialFooterColor);
        setPreviewEstablishmentNameColor(initialNameColor);
        setPreviewFooterTextColor(initialFooterTextColor);

        return {
          logoUrl: headerData.logo_url || '',
          establishmentName: headerData.establishment_name || '',
          logoPosition: headerData.logo_position || 'left',
          logoSize: headerData.logo_size || 'medium',
          themeColor: initialHeaderColor,
          headerColor: initialHeaderColor,
          footerColor: initialFooterColor,
          footerTextColor: initialFooterTextColor,
          establishmentNameColor: initialNameColor,
          footerText: footerData.custom_text || '',
          showSocialLinks: footerData.show_social_links || false,
          facebookUrl: footerData.facebook_url || '',
          instagramUrl: footerData.instagram_url || '',
          twitterUrl: footerData.twitter_url || '',
          footerTextAlignment: footerData.text_alignment || 'left',
          establishmentNameAlignment: headerData.establishment_name_alignment || 'left'
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

  useEffect(() => {
    setPreviewHeaderColor(form.watch('headerColor'));
    setPreviewFooterColor(form.watch('footerColor'));
    setPreviewEstablishmentNameColor(form.watch('establishmentNameColor'));
    setPreviewFooterTextColor(form.watch('footerTextColor'));
  }, [
    form.watch('headerColor'),
    form.watch('footerColor'),
    form.watch('establishmentNameColor'),
    form.watch('footerTextColor')
  ]);

  const onSubmit = async (data: LayoutSettingsForm) => {
    setIsLoading(true);
    try {
      // For header settings
      const headerData = {
        logo_url: data.logoUrl,
        header_color: data.headerColor,
        establishment_name: data.establishmentName,
        establishment_name_alignment: data.establishmentNameAlignment,
        establishment_name_color: data.establishmentNameColor,
        logo_position: data.logoPosition,
        logo_size: data.logoSize
      };

      // First try a SELECT to check if we need to INSERT or UPDATE
      const { data: existingHeader, error: headerCheckError } = await supabase
        .from('header_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (headerCheckError) {
        console.error("Error checking for existing header settings:", headerCheckError);
      }

      // If record exists, update it
      if (existingHeader) {
        const { error: updateError } = await supabase
          .from('header_settings')
          .update(headerData)
          .eq('id', existingHeader.id);
        
        if (updateError) throw updateError;
      } else {
        // If no record exists, insert a new one
        const { error: insertError } = await supabase
          .from('header_settings')
          .insert(headerData);
        
        if (insertError) throw insertError;
      }

      // For footer settings
      const footerValue = {
        custom_text: data.footerText,
        show_social_links: data.showSocialLinks,
        facebook_url: data.facebookUrl,
        instagram_url: data.instagramUrl,
        twitter_url: data.twitterUrl,
        background_color: data.footerColor,
        text_color: data.footerTextColor,
        text_alignment: data.footerTextAlignment
      };

      // First check if footer settings exist
      const { data: existingFooter, error: footerCheckError } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'footer_settings')
        .maybeSingle();

      if (footerCheckError) {
        console.error("Error checking for existing footer settings:", footerCheckError);
      }

      // If record exists, update it
      if (existingFooter) {
        const { error: updateError } = await supabase
          .from('site_settings')
          .update({ value: footerValue })
          .eq('id', existingFooter.id);
        
        if (updateError) throw updateError;
      } else {
        // If no record exists, insert a new one
        const { error: insertError } = await supabase
          .from('site_settings')
          .insert({ key: 'footer_settings', value: footerValue });
        
        if (insertError) throw insertError;
      }

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
    previewHeaderColor,
    previewFooterColor,
    previewEstablishmentNameColor,
    previewFooterTextColor,
    isLoading,
    onSubmit
  };
};
