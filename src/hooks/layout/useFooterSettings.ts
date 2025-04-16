
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table } from "@/types/database.types";

export interface FooterData {
  custom_text: string;
  show_social_links: boolean;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  background_color: string;
  text_color: string;
  text_alignment: "left" | "center" | "right";
}

/**
 * Saves footer settings to the database
 * @param footerData The footer settings to save
 * @returns The saved footer settings
 */
export const saveFooterSettings = async (footerData: FooterData): Promise<Table["site_settings"] | null> => {
  try {
    console.log("Attempting to save footer settings:", footerData);
    
    // Check if footer settings already exist
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
    
    // Upsert pattern: If data exists, update it; otherwise, insert new record
    if (existingFooterData && existingFooterData.length > 0) {
      console.log("Updating existing footer settings with ID:", existingFooterData[0].id);
      
      const { data, error: updateError } = await supabase
        .from('site_settings')
        .update({
          value: footerData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingFooterData[0].id)
        .select();
      
      if (updateError) {
        console.error("Error updating footer settings:", updateError);
        toast.error("Errore durante l'aggiornamento delle impostazioni del footer");
        throw updateError;
      }
      
      result = data;
      console.log("Footer settings updated successfully:", result);
    } else {
      console.log("No existing footer settings found, inserting new record");
      
      const { data, error: insertError } = await supabase
        .from('site_settings')
        .insert({
          key: 'footer_settings',
          value: footerData
        })
        .select();
      
      if (insertError) {
        console.error("Error inserting footer settings:", insertError);
        toast.error("Errore durante l'inserimento delle impostazioni del footer");
        throw insertError;
      }
      
      result = data;
      console.log("New footer settings inserted successfully:", result);
    }
    
    // Cache in localStorage as backup
    try {
      localStorage.setItem("footerSettings", JSON.stringify(footerData));
      console.log("Footer settings cached in localStorage:", footerData);
    } catch (e) {
      console.warn("Could not cache footer settings in localStorage:", e);
    }
    
    return result?.length ? result[0] : null;
  } catch (error) {
    console.error("Error saving footer settings:", error);
    toast.error("Errore durante il salvataggio delle impostazioni del footer");
    throw error;
  }
};

/**
 * Fetches footer settings from the database
 * @returns The footer settings
 */
export const fetchFooterSettings = async (): Promise<FooterData | null> => {
  try {
    console.log("Fetching footer settings from database");
    
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

    if (data?.value) {
      console.log("Footer settings fetched successfully:", data.value);
      
      // Cache in localStorage as backup
      try {
        localStorage.setItem("footerSettings", JSON.stringify(data.value));
        console.log("Footer settings cached in localStorage:", data.value);
      } catch (e) {
        console.warn("Could not cache footer settings in localStorage:", e);
      }
      
      return data.value as FooterData;
    } else {
      console.log("No footer settings found in database");
      return null;
    }
  } catch (error) {
    console.error("Error fetching footer settings:", error);
    toast.error("Errore durante il recupero delle impostazioni del footer");
    throw error;
  }
};
