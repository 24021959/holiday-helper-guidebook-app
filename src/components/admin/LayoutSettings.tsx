import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeaderSettings } from "@/hooks/useHeaderSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { FooterSettings } from "./layout/FooterSettings";
import { LogoSettings } from "./layout/LogoSettings";

export interface LayoutSettingsForm extends HeaderSettings {
  footerText: string;
  showSocialLinks: boolean;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  themeColor: string;
  headerColor: string;
  footerColor: string;
  footerTextAlignment: "left" | "center" | "right";
  establishmentNameAlignment: "left" | "center" | "right";
  establishmentNameColor: string;
}

export const LayoutSettings = () => {
  const [previewHeaderColor, setPreviewHeaderColor] = React.useState("#FFFFFF");
  const [previewFooterColor, setPreviewFooterColor] = React.useState("#FFFFFF");
  const [previewEstablishmentNameColor, setPreviewEstablishmentNameColor] = React.useState("#000000");

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

  // Effect to update previews in real-time
  React.useEffect(() => {
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

  return (
    <div className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="establishmentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Azienda</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci il nome della tua azienda" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="establishmentNameColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colore Testo Nome Azienda</FormLabel>
                    <FormControl>
                      <Input 
                        type="color" 
                        className="h-10 w-full p-1 cursor-pointer" 
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setPreviewEstablishmentNameColor(e.target.value);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="establishmentNameAlignment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allineamento Nome Azienda</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">
                        <span className="flex items-center gap-2">
                          <AlignLeft className="w-4 h-4" />
                          Sinistra
                        </span>
                      </SelectItem>
                      <SelectItem value="center">
                        <span className="flex items-center gap-2">
                          <AlignCenter className="w-4 h-4" />
                          Centro
                        </span>
                      </SelectItem>
                      <SelectItem value="right">
                        <span className="flex items-center gap-2">
                          <AlignRight className="w-4 h-4" />
                          Destra
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="headerColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colore Sfondo Header</FormLabel>
                <FormControl>
                  <Input 
                    type="color" 
                    className="h-10 w-full p-1 cursor-pointer" 
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <LogoSettings form={form} />

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Anteprima Header</h3>
            <div className="rounded-lg overflow-hidden shadow-sm">
              <Header
                backgroundColor={previewHeaderColor}
                logoUrl={form.watch('logoUrl')}
                logoPosition={form.watch('logoPosition')}
                logoSize={form.watch('logoSize')}
                establishmentName={form.watch('establishmentName')}
                establishmentNameAlignment={form.watch('establishmentNameAlignment')}
                establishmentNameColor={previewEstablishmentNameColor}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="footerColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colore Sfondo Footer</FormLabel>
                <FormControl>
                  <Input 
                    type="color" 
                    className="h-10 w-full p-1 cursor-pointer" 
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FooterSettings form={form} />

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Anteprima Footer</h3>
            <div className="rounded-lg overflow-hidden shadow-sm">
              <Footer 
                backgroundColor={previewFooterColor}
              />
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
