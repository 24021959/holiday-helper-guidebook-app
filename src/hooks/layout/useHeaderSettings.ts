
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
      throw headerCheckError;
    }

    if (existingHeaderData && existingHeaderData.length > 0) {
      const { error: updateError } = await supabase
        .from('header_settings')
        .update(headerData)
        .eq('id', existingHeaderData[0].id);
      
      if (updateError) {
        console.error("Error updating header settings:", updateError);
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabase
        .from('header_settings')
        .insert(headerData);
      
      if (insertError) {
        console.error("Error inserting header settings:", insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error saving header settings:", error);
    throw error;
  }
};

export const fetchHeaderSettings = async () => {
  const { data, error } = await supabase
    .from('header_settings')
    .select('*')
    .maybeSingle();

  if (error) {
    console.error("Error loading header settings:", error);
    throw error;
  }

  return data;
};
