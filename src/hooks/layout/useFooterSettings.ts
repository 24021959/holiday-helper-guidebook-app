
import { supabase } from "@/integrations/supabase/client";

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
      throw footerCheckError;
    }

    if (existingFooterData && existingFooterData.length > 0) {
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ value: footerValue })
        .eq('id', existingFooterData[0].id);
      
      if (updateError) {
        console.error("Error updating footer settings:", updateError);
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabase
        .from('site_settings')
        .insert({ key: 'footer_settings', value: footerValue });
      
      if (insertError) {
        console.error("Error inserting footer settings:", insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error saving footer settings:", error);
    throw error;
  }
};

export const fetchFooterSettings = async () => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', 'footer_settings')
    .maybeSingle();

  if (error) {
    console.error("Error loading footer settings:", error);
    throw error;
  }

  return data?.value;
};
