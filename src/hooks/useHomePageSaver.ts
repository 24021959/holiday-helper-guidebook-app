
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "@/context/TranslationContext";
import { Language } from "@/types/translation.types";

export const useHomePageSaver = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { translateSequential } = useTranslation();

  const saveHomePageToDatabase = async () => {
    try {
      setIsSaving(true);

      // Check if home page already exists in Italian
      const { data: existingPage } = await supabase
        .from('custom_pages')
        .select('id')
        .eq('path', '/home')
        .maybeSingle();

      if (existingPage) {
        console.log("La pagina Home in italiano è già stata salvata");
        
        // Check if we need to translate and save in other languages
        await translateAndSaveHomeInAllLanguages();
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

      // Save the Italian home page to the database
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

      toast.success("Pagina Home salvata con successo in italiano");
      
      // Now translate and save in other languages
      await translateAndSaveHomeInAllLanguages();
      
      return pageId;

    } catch (error) {
      console.error("Error saving home page:", error);
      toast.error("Errore nel salvare la pagina Home");
      return null;
    } finally {
      setIsSaving(false);
    }
  };
  
  const translateAndSaveHomeInAllLanguages = async () => {
    try {
      // Get the Italian home page content for translation
      const { data: italianHomePage, error } = await supabase
        .from('custom_pages')
        .select('title, content, image_url, icon')
        .eq('path', '/home')
        .single();
        
      if (error || !italianHomePage) {
        console.error("Italian home page not found:", error);
        return;
      }
      
      // Target languages to translate to - Fix type by providing explicit Language[] type
      const targetLangs: Language[] = ['en', 'fr', 'es', 'de'];
      
      // Translate content to all languages sequentially
      const translations = await translateSequential(
        italianHomePage.content,
        italianHomePage.title,
        targetLangs
      );
      
      // Save each translation to the database
      for (const lang of targetLangs) {
        if (translations[lang]) {
          // Check if translation already exists
          const langPath = `/${lang}`;
          
          const { data: existingTranslation } = await supabase
            .from('custom_pages')
            .select('id')
            .eq('path', langPath)
            .maybeSingle();
            
          const translationData = {
            title: translations[lang].title,
            content: translations[lang].content,
            path: langPath,
            image_url: italianHomePage.image_url,
            icon: italianHomePage.icon,
            is_parent: false,
            is_submenu: false,
            published: true,
            updated_at: new Date().toISOString()
          };
            
          if (existingTranslation) {
            // Update existing translation
            await supabase
              .from('custom_pages')
              .update(translationData)
              .eq('id', existingTranslation.id);
          } else {
            // Insert new translation
            const pageId = uuidv4();
            await supabase
              .from('custom_pages')
              .insert({
                id: pageId,
                ...translationData
              });
              
            // Add menu icon for translated home
            await supabase
              .from('menu_icons')
              .insert({
                path: langPath,
                label: translations[lang].title,
                icon: italianHomePage.icon,
                bg_color: 'bg-blue-200',
                is_submenu: false,
                published: true,
                is_parent: false,
                updated_at: new Date().toISOString()
              });
          }
          
          console.log(`Home page translated and saved in ${lang}`);
        }
      }
      
      toast.success("Home page tradotta e salvata in tutte le lingue");
    } catch (translationError) {
      console.error("Error translating home page:", translationError);
      toast.error("Errore nella traduzione e salvataggio della pagina Home");
    }
  };

  return {
    isSaving,
    saveHomePageToDatabase
  };
};
