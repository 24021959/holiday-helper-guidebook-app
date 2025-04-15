
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HeaderSettings } from "@/hooks/useHeaderSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LayoutSettingsForm extends HeaderSettings {
  footerText: string;
  showSocialLinks: boolean;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  themeColor: string;
}

const colorOptions = [
  { value: "bg-slate-800", label: "Slate" },
  { value: "bg-zinc-800", label: "Zinc" },
  { value: "bg-neutral-800", label: "Neutral" },
  { value: "bg-stone-800", label: "Stone" },
  { value: "bg-red-800", label: "Red" },
  { value: "bg-orange-800", label: "Orange" },
  { value: "bg-amber-800", label: "Amber" },
  { value: "bg-yellow-800", label: "Yellow" },
  { value: "bg-lime-800", label: "Lime" },
  { value: "bg-green-800", label: "Green" },
  { value: "bg-emerald-800", label: "Emerald" },
  { value: "bg-teal-800", label: "Teal" },
  { value: "bg-cyan-800", label: "Cyan" },
  { value: "bg-sky-800", label: "Sky" },
  { value: "bg-blue-800", label: "Blue" },
  { value: "bg-indigo-800", label: "Indigo" },
  { value: "bg-violet-800", label: "Violet" },
  { value: "bg-purple-800", label: "Purple" },
  { value: "bg-fuchsia-800", label: "Fuchsia" },
  { value: "bg-pink-800", label: "Pink" },
  { value: "bg-rose-800", label: "Rose" },
];

export const LayoutSettings = () => {
  const form = useForm<LayoutSettingsForm>({
    defaultValues: async () => {
      const [headerResult, footerResult] = await Promise.all([
        supabase.from('header_settings').select('*').single(),
        supabase.from('site_settings').select('*').eq('key', 'footer_settings').single()
      ]);

      const headerData = headerResult.data || {};
      const footerData = footerResult.data?.value || {};

      return {
        logoUrl: headerData.logo_url || '',
        establishmentName: headerData.establishment_name || '',
        logoPosition: headerData.logo_position || 'left',
        logoSize: headerData.logo_size || 'medium',
        themeColor: headerData.header_color || 'bg-slate-800',
        footerText: footerData.custom_text || '',
        showSocialLinks: footerData.show_social_links || false,
        facebookUrl: footerData.facebook_url || '',
        instagramUrl: footerData.instagram_url || '',
        twitterUrl: footerData.twitter_url || ''
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
            background_color: data.themeColor
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
          {/* Theme Color */}
          <FormField
            control={form.control}
            name="themeColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Colore Tema
                </FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <Button
                      key={color.value}
                      type="button"
                      variant={field.value === color.value ? "default" : "outline"}
                      className={`${color.value} h-8 w-full`}
                      onClick={() => field.onChange(color.value)}
                    >
                      <span className="text-white text-xs">{color.label}</span>
                    </Button>
                  ))}
                </div>
              </FormItem>
            )}
          />

          {/* Logo Section */}
          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <ImageUploader
                  imageUrl={field.value}
                  onImageUploaded={(url) => field.onChange(url)}
                  onImageRemoved={() => field.onChange("")}
                />
              </FormItem>
            )}
          />

          {/* Logo Position */}
          <FormField
            control={form.control}
            name="logoPosition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posizione Logo</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
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

          {/* Logo Size */}
          <FormField
            control={form.control}
            name="logoSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dimensione Logo</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Piccolo</SelectItem>
                    <SelectItem value="medium">Medio</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Establishment Name */}
          <FormField
            control={form.control}
            name="establishmentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Attività</FormLabel>
                <FormControl>
                  <Input placeholder="Nome della tua attività" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Footer Text */}
          <FormField
            control={form.control}
            name="footerText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Testo Footer</FormLabel>
                <FormControl>
                  <Input placeholder="Testo del footer" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Social Links */}
          <FormField
            control={form.control}
            name="showSocialLinks"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <FormLabel>Mostra Social Links</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {form.watch("showSocialLinks") && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="facebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Facebook className="w-4 h-4" />
                      Facebook URL
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram URL
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Twitter className="w-4 h-4" />
                      Twitter URL
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            Salva Impostazioni
          </Button>
        </form>
      </Form>
    </div>
  );
};
