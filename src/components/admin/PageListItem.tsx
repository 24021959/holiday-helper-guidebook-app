
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageData } from "@/pages/Admin";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Eye, Flag, Languages, ChevronDown, ChevronUp } from "lucide-react";

interface PageListItemProps {
  page: PageData;
  translations: PageData[];
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
const LanguageFlag: React.FC<{ language: string, onClick?: () => void, size?: "sm" | "md" }> = ({ 
  language, 
  onClick,
  size = "md" 
}) => {
  const flagSrc = `/flags/${language === 'en' ? 'uk' : language}.png`;
  
  return (
    <img 
      src={flagSrc} 
      alt={languageNames[language]} 
      title={languageNames[language]}
      className={`${size === "sm" ? "h-4 w-6" : "h-5 w-7"} border border-gray-200 rounded ${onClick ? 'cursor-pointer hover:shadow-md transition-transform' : ''}`}
      onClick={onClick}
    />
  );
};

export const PageListItem: React.FC<PageListItemProps> = ({ 
  page, 
  translations,
  onDelete, 
  onEdit, 
  onPreview
}) => {
  const [showTranslations, setShowTranslations] = useState(false);
  
  // Determina la lingua della pagina corrente
  const currentLanguage = getLanguageFromPath(page.path);
  
  // Organizza le traduzioni per lingua
  const translationsByLanguage: Record<string, PageData | undefined> = {};
  translations.forEach(translation => {
    const lang = getLanguageFromPath(translation.path);
    translationsByLanguage[lang] = translation;
  });
  
  // Verifica se ci sono traduzioni disponibili
  const hasTranslations = translations.length > 1;
  
  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-medium">{page.title}</h3>
              <p className="text-sm text-gray-500">
                {page.isSubmenu ? 'Sottomenu' : page.is_parent ? 'Pagina genitore' : 'Pagina normale'} - {page.path}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            {/* Bandierine per le lingue disponibili */}
            <div className="flex items-center gap-1">
              <LanguageFlag language={currentLanguage} />
              <Button 
                variant="ghost" 
                size="sm" 
                className={`px-2 text-blue-600 h-7 ${!hasTranslations ? 'opacity-50' : ''}`}
                onClick={() => setShowTranslations(!showTranslations)}
                disabled={!hasTranslations}
              >
                <Languages className="h-4 w-4 mr-1" />
                <span className="text-xs">Traduzioni</span>
                {hasTranslations && (
                  showTranslations ? 
                    <ChevronUp className="h-3 w-3 ml-1" /> : 
                    <ChevronDown className="h-3 w-3 ml-1" />
                )}
              </Button>
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
                      Sei sicuro di voler eliminare questa pagina e tutte le sue traduzioni? 
                      Questa azione eliminerà {translations.length} pagine e non può essere annullata.
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
        </div>
        
        {/* Area traduzioni (espandibile) */}
        {showTranslations && hasTranslations && (
          <div className="border-t border-gray-100 bg-gray-50 p-3">
            <h4 className="text-sm font-medium mb-2 text-gray-700">Versioni linguistiche disponibili:</h4>
            <div className="grid grid-cols-5 gap-3">
              {['it', 'en', 'fr', 'es', 'de'].map(lang => {
                const translatedPage = translationsByLanguage[lang];
                const hasTranslation = !!translatedPage;
                
                return (
                  <div key={lang} className={`flex flex-col items-center p-2 ${translatedPage?.id === page.id ? 'bg-blue-50 rounded' : ''}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <LanguageFlag language={lang} />
                      <span className="text-xs font-medium">{languageNames[lang]}</span>
                    </div>
                    
                    {hasTranslation ? (
                      <div className="flex space-x-1 mt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded bg-blue-50 hover:bg-blue-100"
                          title={`Anteprima ${languageNames[lang]}`}
                          onClick={() => onPreview(translatedPage.path)}
                        >
                          <Eye className="h-3.5 w-3.5 text-blue-700" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded bg-amber-50 hover:bg-amber-100"
                          title={`Modifica ${languageNames[lang]}`}
                          onClick={() => onEdit(translatedPage)}
                        >
                          <Pencil className="h-3.5 w-3.5 text-amber-700" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic mt-1">Non disponibile</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
