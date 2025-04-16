
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table } from "@/types/database.types";

export interface HeaderData {
  logo_url: string | null;
  header_color: string;
  establishment_name: string;
  establishment_name_alignment: "left" | "center" | "right";
  establishment_name_color: string;
  logo_position: "left" | "center" | "right";
  logo_size: "small" | "medium" | "large";
}

/**
 * Saves header settings to the database
 * @param headerData The header settings to save
 * @returns The saved header settings
 */
export const saveHeaderSettings = async (headerData: HeaderData): Promise<Table["header_settings"] | null> => {
  try {
    console.log("Attempting to save header settings:", headerData);
    
    // Check if header settings already exist
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
    
    // Upsert pattern: If data exists, update it; otherwise, insert new record
    if (existingHeaderData && existingHeaderData.length > 0) {
      console.log("Updating existing header settings with ID:", existingHeaderData[0].id);
      
      const { data, error: updateError } = await supabase
        .from('header_settings')
        .update({
          logo_url: headerData.logo_url,
          header_color: headerData.header_color,
          establishment_name: headerData.establishment_name,
          establishment_name_alignment: headerData.establishment_name_alignment,
          establishment_name_color: headerData.establishment_name_color,
          logo_position: headerData.logo_position,
          logo_size: headerData.logo_size,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingHeaderData[0].id)
        .select();
      
      if (updateError) {
        console.error("Error updating header settings:", updateError);
        toast.error("Errore durante l'aggiornamento delle impostazioni dell'header");
        throw updateError;
      }
      
      result = data;
      console.log("Header settings updated successfully:", result);
    } else {
      console.log("No existing header settings found, inserting new record");
      
      const { data, error: insertError } = await supabase
        .from('header_settings')
        .insert({
          logo_url: headerData.logo_url,
          header_color: headerData.header_color,
          establishment_name: headerData.establishment_name,
          establishment_name_alignment: headerData.establishment_name_alignment,
          establishment_name_color: headerData.establishment_name_color,
          logo_position: headerData.logo_position,
          logo_size: headerData.logo_size
        })
        .select();
      
      if (insertError) {
        console.error("Error inserting header settings:", insertError);
        toast.error("Errore durante l'inserimento delle impostazioni dell'header");
        throw insertError;
      }
      
      result = data;
      console.log("New header settings inserted successfully:", result);
    }
    
    // Cache in localStorage as backup
    try {
      const localStorageData = {
        logoUrl: headerData.logo_url,
        headerColor: headerData.header_color,
        establishmentName: headerData.establishment_name,
        logoPosition: headerData.logo_position,
        logoSize: headerData.logo_size,
        establishmentNameAlignment: headerData.establishment_name_alignment,
        establishmentNameColor: headerData.establishment_name_color
      };
      localStorage.setItem("headerSettings", JSON.stringify(localStorageData));
      console.log("Cached header settings in localStorage:", localStorageData);
    } catch (e) {
      console.warn("Could not cache header settings in localStorage:", e);
    }
    
    return result?.length ? result[0] : null;
  } catch (error) {
    console.error("Error saving header settings:", error);
    toast.error("Errore durante il salvataggio delle impostazioni dell'header");
    throw error;
  }
};

/**
 * Fetches header settings from the database
 * @returns The header settings
 */
export const fetchHeaderSettings = async (): Promise<Table["header_settings"] | null> => {
  try {
    console.log("Fetching header settings from database");
    
    const { data, error } = await supabase
      .from('header_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error loading header settings:", error);
      toast.error("Errore durante il caricamento delle impostazioni dell'header");
      throw error;
    }

    if (data) {
      console.log("Header settings fetched successfully:", data);
      
      // Cache in localStorage as backup
      try {
        localStorage.setItem("headerSettings", JSON.stringify({
          logoUrl: data.logo_url,
          headerColor: data.header_color,
          establishmentName: data.establishment_name,
          logoPosition: data.logo_position,
          logoSize: data.logo_size,
          establishmentNameAlignment: data.establishment_name_alignment,
          establishmentNameColor: data.establishment_name_color
        }));
      } catch (e) {
        console.warn("Could not cache header settings in localStorage:", e);
      }
    } else {
      console.log("No header settings found in database");
    }

    return data;
  } catch (error) {
    console.error("Error fetching header settings:", error);
    toast.error("Errore durante il recupero delle impostazioni dell'header");
    throw error;
  }
};
