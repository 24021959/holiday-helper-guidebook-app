import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Language = 'it' | 'en' | 'fr' | 'es' | 'de';

// Language map for OpenAI API
const languageMap: Record<Language, string> = {
  it: 'Italian',
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  de: 'German'
};

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (text: string) => Promise<string>;
  translateBulk: (texts: string[]) => Promise<string[]>;
  translatePage: (pageContent: string, pageTitle: string) => Promise<{title: string, content: string}>;
  translateSequential: (pageContent: string, pageTitle: string, targetLangs: Language[]) => Promise<Record<Language, {title: string, content: string}>>;
  translateAndCloneMenu: (targetLang: Language, progressCallback?: (completed: number, currentPage?: string) => void) => Promise<void>;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Global translation cache
const globalTranslationCache: Record<string, Record<string, string>> = {
  en: {},
  fr: {},
  es: {},
  de: {},
  it: {}
};

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('it');
  
  // Load the saved language preference on initial load
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && ['it', 'en', 'fr', 'es', 'de'].includes(savedLanguage)) {
      console.log(`Loading saved language: ${savedLanguage}`);
      setLanguage(savedLanguage as Language);
    }
  }, []);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    console.log(`Setting language to: ${language}`);
    localStorage.setItem('selectedLanguage', language);
  }, [language]);

  const translate = async (text: string): Promise<string> => {
    // If the language is Italian (default), return the original text
    if (language === 'it') return text;
    if (!text || text.trim() === '') return text;
    
    // Check global cache first
    if (globalTranslationCache[language][text]) {
      return globalTranslationCache[language][text];
    }
    
    try {
      // Use our custom Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { 
          text, 
          targetLang: languageMap[language]
        }
      });

      if (error) {
        console.error('Translation error from Edge Function:', error);
        throw error;
      }
      
      if (data && data.translatedText) {
        // Save to global cache
        globalTranslationCache[language][text] = data.translatedText;
        return data.translatedText;
      } else {
        throw new Error('No translation returned');
      }
    } catch (error) {
      console.error('Translation error:', error);
      
      // Try using the fallback translation service
      try {
        const fallbackTranslation = await translateWithFallback(text, 'it', language);
        return fallbackTranslation;
      } catch (fallbackError) {
        console.error('Fallback translation also failed:', fallbackError);
        toast.error('Errore di traduzione', { 
          description: 'Impossibile tradurre il testo al momento.' 
        });
        return text; // Return original text on error
      }
    }
  };
  
  const translateBulk = async (texts: string[]): Promise<string[]> => {
    // If the language is Italian or empty array, return the original texts
    if (language === 'it' || texts.length === 0) return texts;
    
    // Filter texts that need translation (not in cache)
    const textsToTranslate: string[] = [];
    const cachedResults: (string | null)[] = [];
    
    texts.forEach((text, index) => {
      if (globalTranslationCache[language][text]) {
        cachedResults[index] = globalTranslationCache[language][text];
      } else {
        textsToTranslate.push(text);
        cachedResults[index] = null;
      }
    });
    
    // If all texts are cached, return cached results
    if (textsToTranslate.length === 0) {
      return cachedResults.map(text => text as string);
    }
    
    try {
      console.log(`Translating ${textsToTranslate.length} texts to ${language}`);
      
      // Use our custom Supabase Edge Function for bulk translation
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { 
          bulkTranslation: textsToTranslate, 
          targetLang: languageMap[language]
        }
      });

      if (error) {
        console.error('Bulk translation error from Edge Function:', error);
        throw error;
      }
      
      if (data && data.translatedTexts && Array.isArray(data.translatedTexts)) {
        // Map translated texts back to original array positions
        let translatedIndex = 0;
        
        const results = texts.map((text, index) => {
          if (cachedResults[index] !== null) {
            // Use cached translation
            return cachedResults[index] as string;
          } else {
            // Use new translation
            const translatedText = data.translatedTexts[translatedIndex++] || text;
            // Save to global cache
            globalTranslationCache[language][text] = translatedText;
            return translatedText;
          }
        });
        
        return results;
      } else {
        throw new Error('Invalid translation response');
      }
    } catch (error) {
      console.error('Bulk translation error:', error);
      // Fallback to individual translations
      const results = await Promise.all(
        texts.map(async (text, index) => {
          if (cachedResults[index] !== null) {
            return cachedResults[index] as string;
          } else {
            try {
              return await translate(text);
            } catch (e) {
              return text; // Return original on error
            }
          }
        })
      );
      
      return results;
    }
  };
  
  // Specialized function to translate an entire page
  const translatePage = async (pageContent: string, pageTitle: string): Promise<{title: string, content: string}> => {
    if (language === 'it') {
      return { title: pageTitle, content: pageContent };
    }
    
    try {
      // Translate title first
      const translatedTitle = await translate(pageTitle);
      
      // For the content, we'll use a specialized approach based on content size
      let translatedContent: string;
      
      // If content is very large, we might need to break it into chunks
      if (pageContent.length > 8000) {
        // Break into paragraphs or sections
        const sections = pageContent.split(/\n\n+/).filter(s => s.trim() !== '');
        
        // Translate sections in batches
        const translatedSections = await translateBulk(sections);
        
        // Rejoin with proper spacing
        translatedContent = translatedSections.join('\n\n');
      } else {
        // Content is small enough for a direct translation
        translatedContent = await translate(pageContent);
      }
      
      return {
        title: translatedTitle,
        content: translatedContent
      };
    } catch (error) {
      console.error('Error translating page:', error);
      toast.error('Errore nella traduzione della pagina', {
        description: 'Non è stato possibile tradurre questa pagina completamente.'
      });
      
      // Return original content as fallback
      return { title: pageTitle, content: pageContent };
    }
  };
  
  // Function to translate sequentially in multiple languages
  const translateSequential = async (
    pageContent: string, 
    pageTitle: string,
    targetLangs: Language[]
  ): Promise<Record<Language, {title: string, content: string}>> => {
    // Inizializziamo il risultato con tutte le lingue come vuote
    const results: Record<Language, {title: string, content: string}> = {
      it: { title: pageTitle, content: pageContent }, // Versione italiana originale
      en: { title: "", content: "" },
      fr: { title: "", content: "" },
      es: { title: "", content: "" },
      de: { title: "", content: "" }
    };
    
    // Traduci il contenuto una lingua alla volta
    for (const lang of targetLangs) {
      if (lang !== 'it') { // Salta l'italiano (è già l'originale)
        try {
          console.log(`Traduzione in corso per ${languageMap[lang]}...`);
          toast.info(`Traduzione in corso: ${languageMap[lang]}`);
          
          // Use direct call to translate edge function
          const { data: titleData, error: titleError } = await supabase.functions.invoke('translate', {
            body: { 
              text: pageTitle, 
              targetLang: languageMap[lang]
            }
          });
          
          if (titleError) {
            console.error(`Error translating title to ${lang}:`, titleError);
            continue;
          }
          
          const translatedTitle = titleData?.translatedText || pageTitle;
          
          // Translate content
          let translatedContent: string;
          
          if (pageContent.length > 8000) {
            // Break into paragraphs or sections for larger content
            const sections = pageContent.split(/\n\n+/).filter(s => s.trim() !== '');
            
            // Translate each section individually
            const translatedSections = [];
            for (const section of sections) {
              if (section.trim() === '') {
                translatedSections.push('');
                continue;
              }
              
              const { data: sectionData, error: sectionError } = await supabase.functions.invoke('translate', {
                body: { 
                  text: section, 
                  targetLang: languageMap[lang]
                }
              });
              
              if (sectionError) {
                console.error(`Error translating section to ${lang}:`, sectionError);
                translatedSections.push(section);
              } else {
                translatedSections.push(sectionData?.translatedText || section);
              }
            }
            
            // Rejoin with proper spacing
            translatedContent = translatedSections.join('\n\n');
          } else {
            // Content is small enough for a direct translation
            const { data: contentData, error: contentError } = await supabase.functions.invoke('translate', {
              body: { 
                text: pageContent, 
                targetLang: languageMap[lang]
              }
            });
            
            if (contentError) {
              console.error(`Error translating content to ${lang}:`, contentError);
              translatedContent = pageContent;
            } else {
              translatedContent = contentData?.translatedText || pageContent;
            }
          }
          
          // Store the result for this language
          results[lang] = {
            title: translatedTitle,
            content: translatedContent
          };
          
          console.log(`Traduzione completata per ${languageMap[lang]}`);
          toast.success(`Traduzione completata: ${languageMap[lang]}`);
          
        } catch (error) {
          console.error(`Error translating to ${lang}:`, error);
          toast.error(`Errore nella traduzione in ${languageMap[lang]}`, {
            description: 'Impossibile completare la traduzione.'
          });
          
          // Add empty/default result for this language in case of error
          results[lang] = { title: pageTitle, content: pageContent };
        }
      }
    }
    
    return results;
  };

  // New function to translate and clone the entire menu for a target language
  const translateAndCloneMenu = async (
    targetLang: Language, 
    progressCallback?: (completed: number, currentPage?: string) => void
  ): Promise<void> => {
    try {
      if (targetLang === 'it') {
        toast.error("Non è necessario tradurre il menu in italiano (lingua base)");
        return;
      }

      toast.info(`Iniziando la traduzione e duplicazione del menu in ${languageMap[targetLang]}...`);
      
      // 1. Get all Italian pages from custom_pages table
      const { data: italianPages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('*')
        .not('path', 'like', '/en/%')
        .not('path', 'like', '/fr/%')
        .not('path', 'like', '/es/%')
        .not('path', 'like', '/de/%')
        .eq('published', true);

      if (pagesError) {
        throw pagesError;
      }

      if (!italianPages || italianPages.length === 0) {
        toast.error("Nessuna pagina italiana trovata da tradurre");
        return;
      }

      console.log(`Trovate ${italianPages.length} pagine italiane da tradurre in ${targetLang}`);
      toast.info(`Traduzione di ${italianPages.length} pagine in corso...`);

      // 2. Process each page in sequence
      let processedCount = 0;
      for (const page of italianPages) {
        try {
          // Update progress with current page title
          if (progressCallback) {
            progressCallback(processedCount, page.title);
          }
          
          // 2.1 Check if this page already has a translation in the target language
          const targetPath = `/${targetLang}${page.path}`;
          const { data: existingTranslation } = await supabase
            .from('custom_pages')
            .select('id')
            .eq('path', targetPath)
            .maybeSingle();

          // 2.2 Translate page title and content
          console.log(`Traduzione pagina: "${page.title}" in ${targetLang}`);
          
          // Translate title
          const { data: titleData, error: titleError } = await supabase.functions.invoke('translate', {
            body: { 
              text: page.title, 
              targetLang: languageMap[targetLang]
            }
          });
          
          if (titleError) {
            console.error(`Error translating title: ${page.title}`, titleError);
            throw titleError;
          }
          
          const translatedTitle = titleData?.translatedText || page.title;
          
          // Translate content
          let translatedContent = page.content;
          if (page.content) {
            const { data: contentData, error: contentError } = await supabase.functions.invoke('translate', {
              body: { 
                text: page.content, 
                targetLang: languageMap[targetLang]
              }
            });
            
            if (contentError) {
              console.error(`Error translating content for page: ${page.title}`, contentError);
              throw contentError;
            }
            
            translatedContent = contentData?.translatedText || page.content;
          }

          // 2.3 Save translated page to custom_pages
          let parentPath = page.parent_path;
          if (parentPath) {
            // Update parent path to use the target language prefix
            parentPath = `/${targetLang}${parentPath}`;
          }
          
          const newPageData = {
            title: translatedTitle,
            content: translatedContent,
            path: targetPath,
            image_url: page.image_url,
            icon: page.icon,
            is_submenu: page.is_submenu,
            parent_path: parentPath,
            published: page.published,
            list_type: page.list_type,
            list_items: page.list_items
          };

          if (existingTranslation) {
            // Update existing translation
            await supabase
              .from('custom_pages')
              .update(newPageData)
              .eq('id', existingTranslation.id);
              
            console.log(`Pagina esistente aggiornata: ${targetPath}`);
          } else {
            // Create new translation
            await supabase
              .from('custom_pages')
              .insert(newPageData);
              
            console.log(`Nuova pagina tradotta creata: ${targetPath}`);
          }

          // 2.4 Create or update matching menu_icons entry
          const { data: existingIcon } = await supabase
            .from('menu_icons')
            .select('id')
            .eq('path', targetPath)
            .maybeSingle();

          const menuIconData = {
            path: targetPath,
            label: translatedTitle,
            icon: page.icon || 'FileText',
            bg_color: 'bg-blue-200',
            is_submenu: page.is_submenu,
            parent_path: parentPath,
            published: page.published
          };

          if (existingIcon) {
            await supabase
              .from('menu_icons')
              .update(menuIconData)
              .eq('id', existingIcon.id);
          } else {
            await supabase
              .from('menu_icons')
              .insert(menuIconData);
          }

          processedCount++;
          
          // Update progress after each page is processed
          if (progressCallback) {
            progressCallback(processedCount);
          }
          
          if (processedCount % 5 === 0) {
            toast.info(`Tradotte ${processedCount} pagine su ${italianPages.length}`);
          }
        } catch (pageError) {
          console.error(`Errore nella traduzione della pagina "${page.title}":`, pageError);
          toast.error(`Errore nella traduzione della pagina: ${page.title}`);
        }
      }

      toast.success(`Traduzione e clonazione del menu in ${languageMap[targetLang]} completata! ${processedCount} pagine tradotte.`);
    } catch (error) {
      console.error(`Errore nella traduzione del menu in ${targetLang}:`, error);
      toast.error(`Errore nella traduzione del menu in ${languageMap[targetLang]}`);
    }
  };

  const value = { 
    language, 
    setLanguage, 
    translate,
    translateBulk,
    translatePage,
    translateSequential,
    translateAndCloneMenu
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

// Fallback translation function using the free MyMemory API
async function translateWithFallback(text: string, sourceLang: string, targetLang: string): Promise<string> {
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`);
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    return text; // Return original text if translation fails
  } catch (error) {
    console.error('Translation API error:', error);
    return text; // Return original text on error
  }
}
