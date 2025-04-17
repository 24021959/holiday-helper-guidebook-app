
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export const useHomePageSaver = () => {
  const [isSaving, setIsSaving] = useState(false);

  const saveHomePageToDatabase = async () => {
    try {
      setIsSaving(true);

      // Check if home page already exists
      const { data: existingPage } = await supabase
        .from('custom_pages')
        .select('id')
        .eq('path', '/home')
        .maybeSingle();

      if (existingPage) {
        toast.info("La pagina Home è già stata salvata nel sistema");
        return;
      }

      const pageId = uuidv4();
      const homeImageUrl = "/lovable-uploads/6d1eebb5-61dd-4e37-99c7-4c67721ca126.png";
      
      // Content for the home page
      const homeContent = `
<div class="prose prose-emerald mb-8">
  <p class="text-lg">Esplora il nostro menu digitale e scopri tutte le informazioni sul nostro hotel, i nostri servizi e la nostra posizione.</p>
  <p>La nostra struttura offre comfort moderni in un ambiente tradizionale italiano. Siamo felici di darvi il benvenuto e rendere il vostro soggiorno il più piacevole possibile.</p>
</div>

<!-- IMAGES -->
{
  "type": "image",
  "url": "${homeImageUrl}",
  "position": "center",
  "caption": "La nostra struttura"
}
`;

      // Save the home page to the database
      const { error } = await supabase
        .from('custom_pages')
        .insert({
          id: pageId,
          title: "Home",
          content: homeContent,
          path: "/home",
          image_url: homeImageUrl,
          icon: "Home",
          is_parent: false,
          is_submenu: false,
          published: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Save menu icon for the home page
      const { error: iconError } = await supabase
        .from('menu_icons')
        .insert({
          path: "/home",
          label: "Home",
          icon: "Home",
          bg_color: 'bg-blue-200',
          is_submenu: false,
          published: true,
          is_parent: false,
          updated_at: new Date().toISOString()
        });

      if (iconError) throw iconError;

      toast.success("Pagina Home salvata con successo nel sistema");
      return pageId;

    } catch (error) {
      console.error("Error saving home page:", error);
      toast.error("Errore nel salvare la pagina Home");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveHomePageToDatabase
  };
};
