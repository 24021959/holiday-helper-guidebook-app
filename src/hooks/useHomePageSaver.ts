
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
      
      // Temporarily remove no-translation flag to allow translation
      const wasNoTranslation = document.body.hasAttribute('data-no-translation');
      if (wasNoTranslation) {
        document.body.removeAttribute('data-no-translation');
      }
      
      // Target languages to translate to
      const targetLangs: Language[] = ['en', 'fr', 'es', 'de'];
      
      console.log("Starting home page translations...");
      console.log("Original content sample:", italianHomePage.content.substring(0, 100));
      
      // Translate content to all languages sequentially
      const translations = await translateSequential(
        italianHomePage.content,
        italianHomePage.title,
        targetLangs
      );
      
      console.log("Translations completed for languages:", Object.keys(translations).join(", "));
      
      // Save each translation to the database with correct language paths
      for (const lang of targetLangs) {
        if (translations[lang]) {
          // Create language-specific path (e.g., /en, /fr, etc.)
          const langPath = `/${lang}`;
          
          console.log(`Saving translation for ${lang}...`);
          console.log(`Translated title: "${translations[lang].title}"`);
          console.log(`Translated content preview: "${translations[lang].content.substring(0, 100)}..."`);
          
          // Check if translation already exists for this language
          const { data: existingTranslation } = await supabase
            .from('custom_pages')
            .select('id')
            .eq('path', langPath)
            .maybeSingle();
            
          const translationData = {
            title: translations[lang].title,
            content: translations[lang].content,
            path: langPath,  // Root path for each language
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
              
            console.log(`Updated home page in ${lang} with translated content`);
          } else {
            // Insert new translation with a unique ID
            const pageId = uuidv4();
            await supabase
              .from('custom_pages')
              .insert({
                id: pageId,
                ...translationData
              });
              
            console.log(`Created new home page in ${lang} with translated content`);
              
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
        }
      }
      
      // Restore the no-translation flag if it was present
      if (wasNoTranslation) {
        document.body.setAttribute('data-no-translation', 'true');
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
