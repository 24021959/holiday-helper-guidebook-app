
import React, { createContext, useState, useContext } from 'react';
import { Language, TranslationContextType as TypedTranslationContextType } from '@/types/translation.types';
import { useTranslationCache } from '@/hooks/translation/useTranslationCache';
import { translateText, translateBulkTexts } from '@/services/translationService';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { delay } from "@/utils/translationUtils";

type TranslationContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (text: string) => Promise<string>;
  translateBulk: (texts: string[]) => Promise<string[]>;
  translatePage: (pageContent: string, pageTitle: string) => Promise<{ title: string; content: string; }>;
  translateSequential: (pageContent: string, pageTitle: string, targetLangs: Language[]) => Promise<Record<Language, { title: string; content: string; }>>;
  translateAndCloneMenu: (targetLang: Language, progressCallback?: (completed: number, currentPage?: string) => void) => Promise<void>;
  t: (text: string) => string;
};

const defaultContext: TranslationContextType = {
  language: 'it',
  setLanguage: () => {},
  translate: async (text: string) => text,
  translateBulk: async (texts: string[]) => texts,
  translatePage: async (content: string, title: string) => ({ title, content }),
  translateSequential: async (content: string, title: string) => ({ 
    it: { title, content },
    en: { title, content },
    fr: { title, content },
    es: { title, content },
    de: { title, content }
  }),
  translateAndCloneMenu: async () => {},
  t: (text: string) => text,
};

export const TranslationContext = createContext<TranslationContextType>(defaultContext);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return (savedLanguage && ['it', 'en', 'fr', 'es', 'de'].includes(savedLanguage)) 
      ? savedLanguage as Language 
      : 'it';
  });
  const { cache, getCached, setCached } = useTranslationCache();

  const translate = async (text: string): Promise<string> => {
    if (language === 'it' || !text || text.trim() === '') return text;
    
    // Check cache first
    const cached = getCached(language, text);
    if (cached) return cached;
    
    try {
      console.log(`Translating to ${language}: "${text.substring(0, 30)}..."`);
      
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { 
          text, 
          targetLang: language
        }
      });

      if (error) {
        console.error("Translation error from edge function:", error);
        throw error;
      }
      
      if (data && data.translatedText) {
        console.log(`Translation successful: "${data.translatedText.substring(0, 30)}..."`);
        setCached(language, text, data.translatedText);
        return data.translatedText;
      }
      
      throw new Error('No translation returned from edge function');
    } catch (error) {
      console.error('Translation error:', error);
      // Return original text in case of error
      return text;
    }
  };

  const translateBulk = async (texts: string[]): Promise<string[]> => {
    if (language === 'it' || texts.length === 0) return texts;

    // Filter texts that need translation (not in cache)
    const textsToTranslate: string[] = [];
    const results: (string | null)[] = new Array(texts.length);
    const indexMapping: Record<number, number> = {};

    texts.forEach((text, index) => {
      if (!text || text.trim() === '') {
        results[index] = text;
        return;
      }
      
      const cached = getCached(language, text);
      if (cached) {
        results[index] = cached;
      } else {
        indexMapping[textsToTranslate.length] = index;
        textsToTranslate.push(text);
        results[index] = null;
      }
    });

    if (textsToTranslate.length === 0) {
      return results.map(r => r as string);
    }

    try {
      console.log(`Bulk translating ${textsToTranslate.length} texts to ${language}`);
      
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { 
          bulkTranslation: textsToTranslate, 
          targetLang: language
        }
      });

      if (error) {
        console.error("Bulk translation error:", error);
        throw error;
      }

      if (data?.translatedTexts && Array.isArray(data.translatedTexts)) {
        textsToTranslate.forEach((_, index) => {
          const originalIndex = indexMapping[index];
          if (originalIndex !== undefined) {
            const translated = data.translatedTexts[index];
            if (translated) {
              results[originalIndex] = translated;
              setCached(language, textsToTranslate[index], translated);
            } else {
              results[originalIndex] = texts[originalIndex];
            }
          }
        });
      }
      
      return results.map((result, index) => {
        return result !== null ? result : texts[index];
      });
    } catch (error) {
      console.error('Bulk translation error:', error);
      // Return original texts in case of error
      return texts;
    }
  };

  const translatePage = async (pageContent: string, pageTitle: string): Promise<{title: string, content: string}> => {
    if (language === 'it') {
      return { title: pageTitle, content: pageContent };
    }
    
    try {
      const translatedTitle = await translate(pageTitle);
      
      let translatedContent: string;
      if (pageContent.length > 8000) {
        const sections = pageContent.split(/\n\n+/).filter(s => s.trim() !== '');
        const translatedSections = await translateBulk(sections);
        translatedContent = translatedSections.join('\n\n');
      } else {
        translatedContent = await translate(pageContent);
      }
      
      return {
        title: translatedTitle,
        content: translatedContent
      };
    } catch (error) {
      console.error('Error translating page:', error);
      toast.error('Errore nella traduzione della pagina');
      return { title: pageTitle, content: pageContent };
    }
  };

  const translateSequential = async (
    pageContent: string, 
    pageTitle: string, 
    targetLangs: Language[] = ['en', 'fr', 'es', 'de']
  ): Promise<Record<Language, { title: string; content: string; }>> => {
    // Create a record with all languages
    const results: Record<Language, { title: string; content: string; }> = {
      it: { title: pageTitle, content: pageContent },
      en: { title: pageTitle, content: pageContent },
      fr: { title: pageTitle, content: pageContent },
      es: { title: pageTitle, content: pageContent },
      de: { title: pageTitle, content: pageContent }
    };
    
    try {
      for (const lang of targetLangs) {
        if (lang === 'it') continue; // Skip Italian as it's the source language
        
        // Save current language
        const currentLanguage = language;
        
        // Temporarily change language for translation
        const { data, error } = await supabase.functions.invoke('translate', {
          body: { 
            text: pageTitle, 
            targetLang: lang 
          }
        });
        
        if (error) throw error;
        
        const translatedTitle = data?.translatedText || pageTitle;
        
        // Translate content
        let translatedContent: string;
        if (pageContent.length > 8000) {
          const sections = pageContent.split(/\n\n+/).filter(s => s.trim() !== '');
          const { data: sectionsData, error: sectionsError } = await supabase.functions.invoke('translate', {
            body: { 
              bulkTranslation: sections, 
              targetLang: lang
            }
          });
          
          if (sectionsError) throw sectionsError;
          
          if (sectionsData?.translatedTexts) {
            translatedContent = sectionsData.translatedTexts.join('\n\n');
          } else {
            translatedContent = pageContent;
          }
        } else {
          const { data: contentData, error: contentError } = await supabase.functions.invoke('translate', {
            body: { 
              text: pageContent, 
              targetLang: lang 
            }
          });
          
          if (contentError) throw contentError;
          translatedContent = contentData?.translatedText || pageContent;
        }
        
        results[lang] = {
          title: translatedTitle,
          content: translatedContent
        };
        
        // Wait a bit to avoid rate limiting
        await delay(500);
      }
      
      return results;
    } catch (error) {
      console.error('Error in sequential translation:', error);
      toast.error('Errore nella traduzione sequenziale');
      return results;
    }
  };

  const translateAndCloneMenu = async (
    targetLang: Language,
    progressCallback?: (completed: number, currentPage?: string) => void
  ) => {
    if (targetLang === 'it') {
      toast.error("La lingua di origine è già l'italiano");
      return;
    }

    try {
      // Fetch all Italian pages
      const { data: italianPages, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*')
        .not('path', 'like', '/en/%')
        .not('path', 'like', '/fr/%') 
        .not('path', 'like', '/es/%')
        .not('path', 'like', '/de/%')
        .eq('published', true);

      if (fetchError) throw fetchError;
      
      if (!italianPages || italianPages.length === 0) {
        toast.error("Nessuna pagina italiana trovata");
        return;
      }

      console.log(`Trovate ${italianPages.length} pagine in italiano da tradurre`);
      
      let totalTranslated = 0;
      const totalPages = italianPages.length;
      
      // Process each page
      for (const page of italianPages) {
        const { title, content, path, icon, image_url, is_submenu, parent_path, is_parent } = page;
        
        // Translate title and content
        try {
          if (progressCallback) {
            progressCallback(totalTranslated, title);
          }
          
          const { data: translationResult, error: translationError } = await supabase.functions.invoke('translate', {
            body: { 
              text: title, 
              targetLang: targetLang
            }
          });
          
          if (translationError) throw translationError;
          
          const translatedTitle = translationResult?.translatedText || title;
          
          // Translate content
          let translatedContent: string;
          if (content && content.length > 0) {
            if (content.length > 8000) {
              // Split long content into sections
              const sections = content.split(/\n\n+/).filter(s => s.trim() !== '');
              
              const { data: sectionsData, error: sectionsError } = await supabase.functions.invoke('translate', {
                body: { 
                  bulkTranslation: sections, 
                  targetLang: targetLang
                }
              });
              
              if (sectionsError) throw sectionsError;
              
              if (sectionsData?.translatedTexts) {
                translatedContent = sectionsData.translatedTexts.join('\n\n');
              } else {
                translatedContent = content;
              }
            } else {
              const { data: contentData, error: contentError } = await supabase.functions.invoke('translate', {
                body: { 
                  text: content, 
                  targetLang: targetLang 
                }
              });
              
              if (contentError) throw contentError;
              translatedContent = contentData?.translatedText || content;
            }
          } else {
            translatedContent = content;
          }

          // Create translated path
          let translatedPath = path;
          if (path === '/home' || path === '/') {
            translatedPath = `/${targetLang}/home`;
          } else {
            translatedPath = `/${targetLang}${path}`;
            // Ensure we don't double prefix paths that already have language prefix
            translatedPath = translatedPath.replace(new RegExp(`^/${targetLang}/${targetLang}/`), `/${targetLang}/`);
          }
          
          // Update parent path if it exists
          let translatedParentPath = parent_path;
          if (parent_path) {
            if (parent_path === '/home' || parent_path === '/') {
              translatedParentPath = `/${targetLang}/home`;
            } else {
              translatedParentPath = `/${targetLang}${parent_path}`;
              // Ensure we don't double prefix
              translatedParentPath = translatedParentPath.replace(new RegExp(`^/${targetLang}/${targetLang}/`), `/${targetLang}/`);
            }
          }

          // Check if translated page already exists
          const { data: existingPage } = await supabase
            .from('custom_pages')
            .select('id')
            .eq('path', translatedPath)
            .maybeSingle();
          
          const pageData = {
            title: translatedTitle,
            content: translatedContent,
            path: translatedPath,
            image_url: image_url,
            icon: icon,
            is_submenu: is_submenu,
            parent_path: translatedParentPath,
            published: true,
            is_parent: is_parent
          };

          if (existingPage) {
            // Update existing page
            const { error: updateError } = await supabase
              .from('custom_pages')
              .update(pageData)
              .eq('id', existingPage.id);
              
            if (updateError) throw updateError;
          } else {
            // Insert new page
            const { error: insertError } = await supabase
              .from('custom_pages')
              .insert({
                ...pageData,
                updated_at: new Date().toISOString()
              });
            
            if (insertError) throw insertError;
          }

          // Update menu icon
          const { data: existingIcon } = await supabase
            .from('menu_icons')
            .select('*')
            .eq('path', translatedPath)
            .maybeSingle();

          const menuData = {
            label: translatedTitle,
            icon: icon,
            bg_color: 'bg-blue-200', // Keep default or fetch from original
            is_submenu: is_submenu,
            parent_path: translatedParentPath,
            published: true,
            is_parent: is_parent,
            path: translatedPath,
            updated_at: new Date().toISOString()
          };

          if (existingIcon) {
            const { error: iconUpdateError } = await supabase
              .from('menu_icons')
              .update(menuData)
              .eq('id', existingIcon.id);

            if (iconUpdateError) throw iconUpdateError;
          } else {
            const { error: iconInsertError } = await supabase
              .from('menu_icons')
              .insert(menuData);

            if (iconInsertError) throw iconInsertError;
          }

          totalTranslated++;
          if (progressCallback) {
            progressCallback(totalTranslated);
          }

          // Add a small delay to avoid rate limiting
          await delay(1000);
          
        } catch (pageError) {
          console.error(`Error translating page ${title}:`, pageError);
          toast.error(`Errore nella traduzione di "${title}"`);
        }
      }
      
      toast.success(`Traduzione completata: ${totalTranslated}/${totalPages} pagine`);
      
    } catch (error) {
      console.error('Error in translateAndCloneMenu:', error);
      toast.error('Errore durante la traduzione del menu');
    }
  };

  const t = (text: string): string => {
    // This is a simple placeholder for future i18n implementation
    // For now, just return the text
    return text;
  };

  return (
    <TranslationContext.Provider value={{
      language,
      setLanguage,
      translate,
      translateBulk,
      translatePage,
      translateSequential,
      translateAndCloneMenu,
      t
    }}>
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
