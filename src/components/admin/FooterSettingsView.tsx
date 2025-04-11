
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { CheckIcon, Edit, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FooterSettings {
  copyright_text: string;
  show_social_links: boolean;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  custom_text: string;
  background_color: string;
  text_alignment: "left" | "center" | "right";
}

const defaultFooterSettings: FooterSettings = {
  copyright_text: "© 2025 Powered by EV-AI Technologies",
  show_social_links: false,
  facebook_url: "",
  instagram_url: "",
  twitter_url: "",
  custom_text: "",
  background_color: "bg-gradient-to-r from-teal-50 to-emerald-50",
  text_alignment: "left"
};

const FooterSettingsView: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const form = useForm<FooterSettings>({
    defaultValues: defaultFooterSettings
  });

  useEffect(() => {
    const loadFooterSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'footer_settings')
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            console.error('Error loading footer settings:', error);
            toast.error('Errore nel caricamento delle impostazioni del footer');
          }
          // If not found, the form will use default values
          return;
        }

        if (data && data.value) {
          form.reset(data.value as FooterSettings);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Errore nel caricamento delle impostazioni del footer');
      } finally {
        setIsLoading(false);
      }
    };

    loadFooterSettings();
  }, [form]);

  const onSubmit = async (data: FooterSettings) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          {
            key: 'footer_settings',
            value: data
          },
          { onConflict: 'key' }
        );

      if (error) {
        throw error;
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      toast.success('Impostazioni del footer salvate con successo');
    } catch (error) {
      console.error('Error saving footer settings:', error);
      toast.error('Errore nel salvataggio delle impostazioni del footer');
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundOptions = [
    { value: "bg-gradient-to-r from-teal-50 to-emerald-50", label: "Verde Chiaro (Default)" },
    { value: "bg-gradient-to-r from-blue-50 to-indigo-50", label: "Blu Chiaro" },
    { value: "bg-gradient-to-r from-gray-50 to-slate-100", label: "Grigio Chiaro" },
    { value: "bg-gradient-to-r from-amber-50 to-yellow-50", label: "Giallo Chiaro" },
    { value: "bg-white", label: "Bianco" },
    { value: "bg-gray-100", label: "Grigio" },
    { value: "bg-emerald-700 text-white", label: "Verde Scuro (Testo Bianco)" },
    { value: "bg-indigo-700 text-white", label: "Blu Scuro (Testo Bianco)" },
    { value: "bg-gray-800 text-white", label: "Grigio Scuro (Testo Bianco)" }
  ];

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-xl font-medium text-emerald-600 mb-4">
        Impostazioni Footer
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Generali</CardTitle>
              <CardDescription>
                Configura le informazioni di base del footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="copyright_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testo Copyright</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="© 2025 Company Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="background_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colore di sfondo</FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border rounded-md"
                        {...field}
                      >
                        {backgroundOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="text_alignment"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Allineamento testo</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                        value={field.value}
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="left" />
                          </FormControl>
                          <FormLabel className="font-normal">Sinistra</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="center" />
                          </FormControl>
                          <FormLabel className="font-normal">Centro</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="right" />
                          </FormControl>
                          <FormLabel className="font-normal">Destra</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="custom_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testo Personalizzato (opzionale)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Inserisci testo aggiuntivo per il footer"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Configura i link ai social media da mostrare nel footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="show_social_links"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Mostra Link Social</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch("show_social_links") && (
                <>
                  <FormField
                    control={form.control}
                    name="facebook_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Facebook</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://facebook.com/yourbusiness" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="instagram_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Instagram</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://instagram.com/yourbusiness" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="twitter_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Twitter</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://twitter.com/yourbusiness" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? 'Salvataggio...' : isSaved ? (
                <span className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" /> Salvato
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="mr-2 h-4 w-4" /> Salva Impostazioni
                </span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FooterSettingsView;
