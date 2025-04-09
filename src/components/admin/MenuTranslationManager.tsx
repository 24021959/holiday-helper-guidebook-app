
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/context/TranslationContext";
import { Loader2, Globe, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const languageNames = {
  en: "Inglese 🇬🇧",
  fr: "Francese 🇫🇷",
  es: "Spagnolo 🇪🇸",
  de: "Tedesco 🇩🇪",
};

type Language = 'en' | 'fr' | 'es' | 'de';

const MenuTranslationManager: React.FC = () => {
  const { translateAndCloneMenu } = useTranslation();
  const [isTranslating, setIsTranslating] = useState<Record<Language, boolean>>({
    en: false,
    fr: false,
    es: false,
    de: false
  });
  const [translated, setTranslated] = useState<Record<Language, boolean>>({
    en: false,
    fr: false,
    es: false,
    de: false
  });

  const handleTranslateMenu = async (language: Language) => {
    try {
      setIsTranslating(prev => ({ ...prev, [language]: true }));
      toast.info(`Avvio traduzione del menu in ${languageNames[language]}`);
      
      await translateAndCloneMenu(language);
      
      setTranslated(prev => ({ ...prev, [language]: true }));
      toast.success(`Menu tradotto in ${languageNames[language]} con successo!`);
    } catch (error) {
      console.error(`Errore nella traduzione del menu in ${language}:`, error);
      toast.error(`Errore nella traduzione del menu in ${languageNames[language]}`);
    } finally {
      setIsTranslating(prev => ({ ...prev, [language]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-emerald-700">Traduzione e Importazione Menu</CardTitle>
          <CardDescription>
            Traduci e importa tutte le pagine esistenti nei rispettivi menu in lingue diverse. 
            Questo processo tradurrà automaticamente tutte le pagine in italiano e le inserirà nel menu corrispondente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                <div className="text-amber-800 text-sm">
                  <p className="font-medium mb-1">Importante:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Questo processo tradurrà e clomerà <strong>tutte</strong> le pagine in italiano nei menu delle rispettive lingue</li>
                    <li>La procedura potrebbe richiedere diversi minuti a seconda del numero di pagine</li>
                    <li>Ogni lingua viene elaborata separatamente: esegui una traduzione alla volta</li>
                    <li>Le pagine già tradotte verranno aggiornate con l'ultima versione in italiano</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-700 mb-2">Seleziona la lingua da tradurre:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['en', 'fr', 'es', 'de'] as Language[]).map(lang => (
                <Card key={lang} className={`border ${translated[lang] ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 mr-2 text-blue-600" />
                        <span className="text-lg font-medium">{languageNames[lang]}</span>
                      </div>
                      {translated[lang] && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          <Check className="h-3 w-3 mr-1" /> Tradotto
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4">
                      <Button 
                        onClick={() => handleTranslateMenu(lang)}
                        disabled={isTranslating[lang]}
                        className="w-full"
                        variant={translated[lang] ? "outline" : "default"}
                      >
                        {isTranslating[lang] ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Traduzione in corso...
                          </>
                        ) : translated[lang] ? (
                          "Traduci di nuovo"
                        ) : (
                          `Traduci in ${languageNames[lang]}`
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuTranslationManager;
