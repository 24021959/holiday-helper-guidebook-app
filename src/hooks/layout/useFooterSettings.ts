
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FooterValue {
  custom_text: string;
  show_social_links: boolean;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  background_color: string;
  text_color: string;
  text_alignment: "left" | "center" | "right";
}

export const saveFooterSettings = async (footerValue: FooterValue) => {
  try {
    const { data: existingFooterData, error: footerCheckError } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'footer_settings');

    if (footerCheckError) {
      console.error("Error checking footer settings:", footerCheckError);
      toast.error("Errore durante il controllo delle impostazioni del footer");
      throw footerCheckError;
    }

    let result;
    if (existingFooterData && existingFooterData.length > 0) {
      console.log("Updating existing footer settings:", footerValue);
      const { data, error: updateError } = await supabase
        .from('site_settings')
        .update({ value: footerValue })
        .eq('id', existingFooterData[0].id)
        .select();
      
      if (updateError) {
        console.error("Error updating footer settings:", updateError);
        toast.error("Errore durante l'aggiornamento delle impostazioni del footer");
        throw updateError;
      }
      result = data;
      console.log("Footer settings saved:", result);
    } else {
      console.log("Inserting new footer settings:", footerValue);
      const { data, error: insertError } = await supabase
        .from('site_settings')
        .insert({ key: 'footer_settings', value: footerValue })
        .select();
      
      if (insertError) {
        console.error("Error inserting footer settings:", insertError);
        toast.error("Errore durante l'inserimento delle impostazioni del footer");
        throw insertError;
      }
      result = data;
      console.log("Footer settings inserted:", result);
    }
    
    console.log("Footer settings saved successfully:", result);
    toast.success("Impostazioni del footer salvate con successo");
    return result;
  } catch (error) {
    console.error("Error saving footer settings:", error);
    toast.error("Errore durante il salvataggio delle impostazioni del footer");
    throw error;
  }
};

export const fetchFooterSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'footer_settings')
      .maybeSingle();

    if (error) {
      console.error("Error loading footer settings:", error);
      toast.error("Errore durante il caricamento delle impostazioni del footer");
      throw error;
    }

    console.log("Fetched footer settings:", data?.value);
    return data?.value;
  } catch (error) {
    console.error("Error fetching footer settings:", error);
    toast.error("Errore durante il recupero delle impostazioni del footer");
    throw error;
  }
};
