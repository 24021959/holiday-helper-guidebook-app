import React, { useState } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { HeaderSettings } from "@/hooks/useHeaderSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeColorPicker } from "./layout/ThemeColorPicker";
import { LogoSettings } from "./layout/LogoSettings";
import { FooterSettings } from "./layout/FooterSettings";

export interface LayoutSettingsForm extends HeaderSettings {
  footerText: string;
  showSocialLinks: boolean;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  themeColor: string;
  footerTextAlignment: "left" | "center" | "right";
}

export const LayoutSettings = () => {
  const [tempColor, setTempColor] = useState("#FFFFFF");

  const form = useForm<LayoutSettingsForm>({
    defaultValues: async () => {
      const [headerResult, footerResult] = await Promise.all([
        supabase.from('header_settings').select('*').single(),
        supabase.from('site_settings').select('*').eq('key', 'footer_settings').single()
      ]);

      const headerData = headerResult.data || {};
      const footerData = footerResult.data?.value || {};

      const initialColor = headerData.header_color || '#FFFFFF';
      setTempColor(initialColor);

      return {
        logoUrl: headerData.logo_url || '',
        establishmentName: headerData.establishment_name || '',
        logoPosition: headerData.logo_position || 'left',
        logoSize: headerData.logo_size || 'medium',
        themeColor: initialColor,
        footerText: footerData.custom_text || '',
        showSocialLinks: footerData.show_social_links || false,
        facebookUrl: footerData.facebook_url || '',
        instagramUrl: footerData.instagram_url || '',
        twitterUrl: footerData.twitter_url || '',
        footerTextAlignment: footerData.text_alignment || 'left'
      };
    }
  });

  const onSubmit = async (data: LayoutSettingsForm) => {
    try {
      // Update header settings
      const { error: headerError } = await supabase
        .from('header_settings')
        .upsert({
          logo_url: data.logoUrl,
          header_color: data.themeColor,
          establishment_name: data.establishmentName,
          logo_position: data.logoPosition,
          logo_size: data.logoSize
        });

      if (headerError) throw headerError;

      // Update footer settings
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
            background_color: data.themeColor,
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

  const handleColorChange = (color: string) => {
    setTempColor(color);
  };

  const applyColor = () => {
    form.setValue('themeColor', tempColor);
    toast.success("Colore applicato");
  };

  // Watch form values for live preview
  const headerPreviewValues = form.watch([
    'logoUrl',
    'themeColor',
    'establishmentName',
    'logoPosition',
    'logoSize'
  ]);

  const footerPreviewValues = form.watch([
    'footerText',
    'showSocialLinks',
    'facebookUrl',
    'instagramUrl',
    'twitterUrl',
    'themeColor',
    'footerTextAlignment'
  ]);

  return (
    <div className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <ThemeColorPicker
            form={form}
            tempColor={tempColor}
            onColorChange={handleColorChange}
            onApplyColor={applyColor}
          />
          
          <LogoSettings form={form} />

          {/* Header Preview */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Anteprima Header</h3>
            <div className="rounded-lg overflow-hidden shadow-sm">
              <Header
                backgroundColor={headerPreviewValues[1]}
                logoUrl={headerPreviewValues[0]}
                logoPosition={headerPreviewValues[3]}
                logoSize={headerPreviewValues[4]}
                establishmentName={headerPreviewValues[2]}
              />
            </div>
          </div>

          <FooterSettings form={form} />

          {/* Footer Preview */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Anteprima Footer</h3>
            <div className="rounded-lg overflow-hidden shadow-sm">
              <Footer />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Salva Impostazioni
          </Button>
        </form>
      </Form>
    </div>
  );
};
