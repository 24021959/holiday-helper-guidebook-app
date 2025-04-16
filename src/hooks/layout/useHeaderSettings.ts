
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeaderData {
  logo_url: string | null;
  header_color: string;
  establishment_name: string;
  establishment_name_alignment: "left" | "center" | "right";
  establishment_name_color: string;
  logo_position: "left" | "center" | "right";
  logo_size: "small" | "medium" | "large";
}

export const saveHeaderSettings = async (headerData: HeaderData) => {
  try {
    const { data: existingHeaderData, error: headerCheckError } = await supabase
      .from('header_settings')
      .select('*')
      .limit(1);

    if (headerCheckError) {
      console.error("Error checking header settings:", headerCheckError);
      toast.error("Errore durante il controllo delle impostazioni dell'header");
      throw headerCheckError;
    }

    let result;
    if (existingHeaderData && existingHeaderData.length > 0) {
      console.log("Updating existing header settings:", headerData);
      const { data, error: updateError } = await supabase
        .from('header_settings')
        .update(headerData)
        .eq('id', existingHeaderData[0].id)
        .select();
      
      if (updateError) {
        console.error("Error updating header settings:", updateError);
        toast.error("Errore durante l'aggiornamento delle impostazioni dell'header");
        throw updateError;
      }
      result = data;
    } else {
      console.log("Inserting new header settings:", headerData);
      const { data, error: insertError } = await supabase
        .from('header_settings')
        .insert(headerData)
        .select();
      
      if (insertError) {
        console.error("Error inserting header settings:", insertError);
        toast.error("Errore durante l'inserimento delle impostazioni dell'header");
        throw insertError;
      }
      result = data;
    }
    
    console.log("Header settings saved successfully:", result);
    toast.success("Impostazioni dell'header salvate con successo");
    return result;
  } catch (error) {
    console.error("Error saving header settings:", error);
    toast.error("Errore durante il salvataggio delle impostazioni dell'header");
    throw error;
  }
};

export const fetchHeaderSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('header_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error("Error loading header settings:", error);
      toast.error("Errore durante il caricamento delle impostazioni dell'header");
      throw error;
    }

    console.log("Fetched header settings:", data);
    return data;
  } catch (error) {
    console.error("Error fetching header settings:", error);
    toast.error("Errore durante il recupero delle impostazioni dell'header");
    throw error;
  }
};
