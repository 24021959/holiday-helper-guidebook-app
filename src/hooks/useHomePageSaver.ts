
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useHomeTranslator } from "./home/useHomeTranslator";
import { createHomeContent, DEFAULT_HOME_IMAGE, saveHomePage, saveMenuIcon } from "@/utils/homePageUtils";
import { Language } from "@/types/translation.types";

export const useHomePageSaver = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { translateAndSaveHome } = useHomeTranslator();

  const saveHomePageToDatabase = async () => {
    try {
      setIsSaving(true);

      // Check if home page exists in Italian
      const { data: existingPage } = await supabase
        .from('custom_pages')
        .select('id, title, content')
        .eq('path', '/home')
        .maybeSingle();

      if (existingPage) {
        console.log("La pagina Home in italiano è già stata salvata");
        
        // Translate to other languages if Italian page exists
        const targetLangs: Language[] = ['en', 'fr', 'es', 'de'];
        await translateAndSaveHome(
          existingPage.title,
          existingPage.content,
          DEFAULT_HOME_IMAGE,
          targetLangs
        );
        return;
      }

      // Create Italian home page if it doesn't exist
      const pageId = uuidv4();
      const homeTitle = "Home";
      const homeContent = createHomeContent(DEFAULT_HOME_IMAGE);
      
      // Save the Italian home page
      await saveHomePage({
        id: pageId,
        title: homeTitle,
        content: homeContent,
        path: "/home",
        imageUrl: DEFAULT_HOME_IMAGE
      });

      // Save menu icon for Italian home
      await saveMenuIcon("/home", homeTitle);
      
      // Translate to other languages
      const targetLangs: Language[] = ['en', 'fr', 'es', 'de'];
      await translateAndSaveHome(homeTitle, homeContent, DEFAULT_HOME_IMAGE, targetLangs);
      
      return pageId;
    } catch (error) {
      console.error("Error saving home page:", error);
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

