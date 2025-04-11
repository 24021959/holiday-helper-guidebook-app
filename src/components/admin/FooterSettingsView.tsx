
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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { CheckIcon, Save, InfoIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { colorPalette } from "@/utils/colorPalette";

interface FooterSettings {
  custom_text: string;
  show_social_links: boolean;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  background_color: string;
  text_alignment: "left" | "center" | "right";
}

const defaultFooterSettings: FooterSettings = {
  custom_text: "© 2025 Powered by EV-AI Technologies",
  show_social_links: false,
  facebook_url: "",
  instagram_url: "",
  twitter_url: "",
  background_color: colorPalette.lightGradients.tealEmerald,
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
    { value: colorPalette.lightGradients.tealEmerald, label: "Verde Chiaro", color: "from-teal-50 to-emerald-50" },
    { value: colorPalette.lightGradients.blueIndigo, label: "Blu Chiaro", color: "from-blue-50 to-indigo-50" },
    { value: colorPalette.lightGradients.graySlate, label: "Grigio Chiaro", color: "from-gray-50 to-slate-100" },
    { value: colorPalette.lightGradients.amberYellow, label: "Giallo Chiaro", color: "from-amber-50 to-yellow-50" },
    { value: colorPalette.solid.white, label: "Bianco", color: "bg-white" },
    { value: colorPalette.solid.grayLight, label: "Grigio", color: "bg-gray-100" },
    { value: colorPalette.solid.emeraldDark, label: "Verde Scuro", color: "bg-emerald-700" },
    { value: colorPalette.solid.indigoDark, label: "Blu Scuro", color: "bg-indigo-700" },
    { value: colorPalette.solid.grayDark, label: "Grigio Scuro", color: "bg-gray-800" }
  ];

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-xl font-medium text-emerald-600 mb-4">
        Impostazioni Footer
      </h2>
      
      <Alert className="mb-6 bg-amber-50 border-amber-200">
        <InfoIcon className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-700">
          Nota: Il colore del footer verrà automaticamente abbinato al colore dell'header. Le impostazioni sottostanti verranno utilizzate solo se non viene selezionato un colore dell'header.
        </AlertDescription>
      </Alert>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Generali</CardTitle>
              <CardDescription>
                Configura il testo e l'aspetto del footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <FormLabel>Testo Personalizzato</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="© 2025 Company Name - Inserisci testo per il footer"
                        className="min-h-[80px]"
                      />
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
                    <FormLabel>Colore di sfondo (fallback)</FormLabel>
                    <p className="text-xs text-gray-500 mb-2">Questo colore verrà usato solo se non c'è un colore dell'header abbinato</p>
                    <FormControl>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {backgroundOptions.map((option) => (
                          <div 
                            key={option.value}
                            className={`
                              flex items-center p-2 border rounded-md cursor-pointer
                              ${field.value === option.value ? 'ring-2 ring-emerald-500' : ''}
                            `}
                            onClick={() => field.onChange(option.value)}
                          >
                            <div 
                              className={`w-8 h-8 rounded mr-2 bg-gradient-to-r ${option.color}`}
                            ></div>
                            <span>{option.label}</span>
                          </div>
                        ))}
                      </div>
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
                          <input 
                            className="w-full p-2 border rounded-md" 
                            {...field} 
                            placeholder="https://facebook.com/yourbusiness" 
                          />
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
                          <input 
                            className="w-full p-2 border rounded-md" 
                            {...field} 
                            placeholder="https://instagram.com/yourbusiness" 
                          />
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
                          <input 
                            className="w-full p-2 border rounded-md" 
                            {...field} 
                            placeholder="https://twitter.com/yourbusiness" 
                          />
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
