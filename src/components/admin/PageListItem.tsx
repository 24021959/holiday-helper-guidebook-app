
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageData } from "@/pages/Admin";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Eye, Flag, Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface PageListItemProps {
  page: PageData;
  onDelete: (id: string) => void;
  onEdit: (page: PageData) => void;
  onPreview: (path: string) => void;
}

// Determina la lingua da un percorso
const getLanguageFromPath = (path: string): string => {
  const match = path.match(/^\/([a-z]{2})\//);
  return match ? match[1] : 'it';
};

// Struttura per i nomi delle lingue
const languageNames: Record<string, string> = {
  it: 'Italiano',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch'
};

// Componente per visualizzare la bandiera della lingua
const LanguageFlag: React.FC<{ language: string, onClick?: () => void }> = ({ language, onClick }) => {
  const flagSrc = `/flags/${language === 'en' ? 'uk' : language}.png`;
  
  return (
    <img 
      src={flagSrc} 
      alt={languageNames[language]} 
      title={languageNames[language]}
      className={`h-5 w-7 border border-gray-200 rounded ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    />
  );
};

export const PageListItem: React.FC<PageListItemProps> = ({ 
  page, 
  onDelete, 
  onEdit, 
  onPreview
}) => {
  const [translations, setTranslations] = useState<PageData[]>([]);
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  
  // Determina la lingua della pagina corrente
  const currentLanguage = getLanguageFromPath(page.path);
  
  // Calcola il percorso base senza il prefisso della lingua
  const getBasePath = (path: string): string => {
    return path.replace(/^\/[a-z]{2}/, '');
  };
  
  const basePath = getBasePath(page.path);
  
  // Carica le traduzioni disponibili
  const loadTranslations = async () => {
    setIsLoadingTranslations(true);
    
    try {
      // Determiniamo se siamo in una pagina principale o in una traduzione
      const cleanPath = page.path.replace(/^\/[a-z]{2}/, '');
      const pathsToCheck = [
        cleanPath,           // Versione senza prefisso lingua
        `/en${cleanPath}`,   // Versione inglese
        `/fr${cleanPath}`,   // Versione francese
        `/es${cleanPath}`,   // Versione spagnola
        `/de${cleanPath}`    // Versione tedesca
      ];
      
      // Carica tutte le pagine con lo stesso percorso base ma lingue diverse
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .in('path', pathsToCheck);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const translatedPages = data.map(p => ({
          id: p.id,
          title: p.title,
          content: p.content,
          path: p.path,
          imageUrl: p.image_url,
          icon: p.icon,
          isSubmenu: p.is_submenu,
          parentPath: p.parent_path,
          published: p.published,
          is_parent: false
        }));
        
        console.log("Traduzioni trovate:", translatedPages.length);
        setTranslations(translatedPages);
      }
    } catch (error) {
      console.error("Errore nel caricamento delle traduzioni:", error);
      toast.error("Errore nel caricamento delle traduzioni");
    } finally {
      setIsLoadingTranslations(false);
    }
  };
  
  // Carica le traduzioni all'apertura della card
  useEffect(() => {
    if (showTranslations) {
      loadTranslations();
    }
  }, [showTranslations]);
  
  // Raggruppa le traduzioni per lingua
  const translationsByLanguage: Record<string, PageData | undefined> = {};
  translations.forEach(translation => {
    const lang = getLanguageFromPath(translation.path);
    translationsByLanguage[lang] = translation;
  });
  
  // Funzione per gestire l'anteprima di una traduzione
  const handlePreviewTranslation = (path: string) => {
    onPreview(path);
  };
  
  // Funzione per modificare una traduzione
  const handleEditTranslation = (translatedPage: PageData) => {
    onEdit(translatedPage);
  };
  
  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium">{page.title}</h3>
            <p className="text-sm text-gray-500">
              {page.isSubmenu ? 'Sottomenu' : page.is_parent ? 'Pagina genitore' : 'Pagina normale'} - {page.path}
            </p>
            
            {/* Bandierine per le lingue disponibili */}
            <div className="flex items-center mt-2 space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-2 text-blue-600 h-7"
                onClick={() => setShowTranslations(!showTranslations)}
              >
                <Languages className="h-4 w-4 mr-1" />
                <span className="text-xs">Traduzioni</span>
              </Button>
              
              {/* Mostra la bandiera della lingua corrente */}
              <LanguageFlag language={currentLanguage} />
            </div>
            
            {/* Area traduzioni */}
            {showTranslations && (
              <div className="mt-3 pt-3 border-t">
                <h4 className="text-sm font-medium mb-2 text-gray-700">Versioni linguistiche:</h4>
                
                {isLoadingTranslations ? (
                  <div className="flex items-center space-x-2 text-gray-500 text-sm">
                    <div className="h-3 w-3 border-2 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <span>Caricamento traduzioni...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-2">
                    {['it', 'en', 'fr', 'es', 'de'].map(lang => {
                      const translatedPage = translationsByLanguage[lang];
                      const hasTranslation = !!translatedPage;
                      
                      return (
                        <div key={lang} className="flex flex-col items-center">
                          <LanguageFlag language={lang} />
                          
                          <div className="mt-1 flex space-x-1">
                            {hasTranslation ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full bg-blue-50 hover:bg-blue-100"
                                  title={`Anteprima ${languageNames[lang]}`}
                                  onClick={() => handlePreviewTranslation(translatedPage.path)}
                                >
                                  <Eye className="h-3 w-3 text-blue-700" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full bg-amber-50 hover:bg-amber-100"
                                  title={`Modifica ${languageNames[lang]}`}
                                  onClick={() => handleEditTranslation(translatedPage)}
                                >
                                  <Pencil className="h-3 w-3 text-amber-700" />
                                </Button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 italic">N/A</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPreview(page.path)}
              title="Anteprima"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(page)}
              title="Modifica"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  title="Elimina"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sei sicuro di voler eliminare questa pagina? Questa azione non può essere annullata.
                    {!page.isSubmenu && " Verranno eliminate anche tutte le sottopagine."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(page.id)}>
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
