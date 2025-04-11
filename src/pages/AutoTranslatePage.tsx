
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/context/TranslationContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TranslatedText from "@/components/TranslatedText";
import BackToMenu from "@/components/BackToMenu";
import { toast } from "sonner";
import { Loader2, Globe, ArrowLeft } from "lucide-react";

const AutoTranslatePage: React.FC = () => {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const { headerSettings, loading: headerLoading } = useHeaderSettings();
  const [pageContent, setPageContent] = useState<string>("");
  const [pageTitle, setPageTitle] = useState<string>("Pagina di esempio");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  useEffect(() => {
    // Simulate loading some initial content
    const timer = setTimeout(() => {
      setPageContent("Questa è una pagina di esempio che dimostra la traduzione automatica in tutte le lingue disponibili. Il contenuto verrà tradotto automaticamente in base alla lingua selezionata dall'utente.");
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleCreateAndTranslate = async () => {
    try {
      setIsCreating(true);
      toast.info("Creazione e traduzione delle pagine in corso...");
      
      // Generate sanitized path from title
      const sanitizedTitle = pageTitle
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      const basePath = `/${sanitizedTitle}`;
      
      // First, save the Italian version
      await savePage({
        title: pageTitle,
        content: pageContent,
        path: basePath,
        language: 'it'
      });
      
      // Then automatically create translated versions
      const targetLangs: ("en" | "fr" | "es" | "de")[] = ['en', 'fr', 'es', 'de'];
      
      for (const lang of targetLangs) {
        toast.info(`Traduzione in corso: ${lang.toUpperCase()}`);
        
        // Call the translation function
        const { data: translationData, error: translationError } = await supabase.functions.invoke('translate', {
          body: { 
            text: pageContent, 
            targetLang: getLanguageName(lang)
          }
        });
        
        if (translationError) {
          console.error(`Error translating content to ${lang}:`, translationError);
          toast.error(`Errore nella traduzione in ${lang.toUpperCase()}`);
          continue;
        }
        
        const translatedContent = translationData?.translatedText || pageContent;
        
        // Translate the title
        const { data: titleData, error: titleError } = await supabase.functions.invoke('translate', {
          body: { 
            text: pageTitle, 
            targetLang: getLanguageName(lang)
          }
        });
        
        if (titleError) {
          console.error(`Error translating title to ${lang}:`, titleError);
          toast.error(`Errore nella traduzione del titolo in ${lang.toUpperCase()}`);
          continue;
        }
        
        const translatedTitle = titleData?.translatedText || pageTitle;
        
        // Save the translated page
        await savePage({
          title: translatedTitle,
          content: translatedContent,
          path: `/${lang}${basePath}`,
          language: lang
        });
        
        toast.success(`Pagina tradotta in ${lang.toUpperCase()} creata con successo`);
      }
      
      toast.success("Tutte le pagine sono state create e tradotte con successo!");
      
      // Navigate to the menu
      setTimeout(() => {
        navigate('/menu');
      }, 2000);
      
    } catch (error) {
      console.error("Error in page creation:", error);
      toast.error("Si è verificato un errore durante la creazione delle pagine");
    } finally {
      setIsCreating(false);
    }
  };
  
  const getLanguageName = (langCode: string): string => {
    const langMap: Record<string, string> = {
      it: 'Italian',
      en: 'English',
      fr: 'French',
      es: 'Spanish',
      de: 'German'
    };
    
    return langMap[langCode] || 'English';
  };
  
  const savePage = async ({ title, content, path, language }: { 
    title: string; 
    content: string; 
    path: string;
    language: string;
  }) => {
    // Check if page already exists
    const { data: existingPage } = await supabase
      .from('custom_pages')
      .select('id')
      .eq('path', path)
      .maybeSingle();
      
    const pageData = {
      title,
      content,
      path,
      icon: 'FileText',
      published: true
    };
    
    // Save to custom_pages
    if (existingPage) {
      await supabase
        .from('custom_pages')
        .update(pageData)
        .eq('id', existingPage.id);
    } else {
      await supabase
        .from('custom_pages')
        .insert(pageData);
    }
    
    // Also add to menu icons
    const menuIconData = {
      path,
      label: title,
      icon: 'FileText',
      bg_color: 'bg-blue-200',
      published: true
    };
    
    const { data: existingIcon } = await supabase
      .from('menu_icons')
      .select('id')
      .eq('path', path)
      .maybeSingle();
      
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
  };

  if (headerLoading || isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="mt-4 text-emerald-700">
          <TranslatedText text="Caricamento..." />
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        backgroundColor={headerSettings.headerColor || "bg-white"}
        logoUrl={headerSettings.logoUrl || undefined}
        establishmentName={headerSettings.establishmentName || undefined}
        logoPosition={headerSettings.logoPosition as "left" | "center" | "right" || "left"}
        logoSize={headerSettings.logoSize as "small" | "medium" | "large" || "medium"}
        showAdminButton={true}
      />
      
      <div className="flex-1 py-8 px-4 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/menu')}
              className="flex items-center gap-1 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <TranslatedText text="Torna al menu" />
            </Button>
            
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                <CardTitle className="text-2xl">
                  <TranslatedText text="Pagina con Traduzione Automatica" />
                </CardTitle>
                <CardDescription className="text-white/90">
                  <TranslatedText text="Questa pagina crea automaticamente le traduzioni in tutte le lingue supportate" />
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <TranslatedText text="Titolo della pagina" />
                    </label>
                    <input 
                      type="text" 
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <TranslatedText text="Contenuto della pagina" />
                    </label>
                    <textarea
                      value={pageContent}
                      onChange={(e) => setPageContent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm min-h-32"
                      rows={4}
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex items-start gap-3">
                    <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">
                        <TranslatedText text="Traduzione automatica abilitata" />
                      </p>
                      <p>
                        <TranslatedText text="Questa pagina verrà automaticamente tradotta e creata nelle seguenti lingue:" />
                        {" 🇬🇧 English, 🇫🇷 Français, 🇪🇸 Español, 🇩🇪 Deutsch"}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleCreateAndTranslate} 
                    disabled={isCreating}
                    className="w-full"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <TranslatedText text="Creazione e traduzione in corso..." />
                      </>
                    ) : (
                      <>
                        <Globe className="mr-2 h-4 w-4" />
                        <TranslatedText text="Crea pagina con traduzioni automatiche" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AutoTranslatePage;
