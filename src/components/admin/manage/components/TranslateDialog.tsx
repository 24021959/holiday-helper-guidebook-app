
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageData } from "@/types/page.types";
import { Language } from "@/types/translation.types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface TranslateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  page: PageData | null;
  isTranslating: boolean;
  targetLanguage: Language;
  setTargetLanguage: (lang: Language) => void;
  isTranslatingAll: boolean;
  setIsTranslatingAll: (value: boolean) => void;
  onConfirm: () => Promise<void>;
}

export const TranslateDialog: React.FC<TranslateDialogProps> = ({
  isOpen,
  onOpenChange,
  page,
  isTranslating,
  targetLanguage,
  setTargetLanguage,
  isTranslatingAll,
  setIsTranslatingAll,
  onConfirm,
}) => {
  // Always default to translating all languages when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsTranslatingAll(true);
    }
  }, [isOpen, setIsTranslatingAll]);

  // Handle the confirmation with proper async/await
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error during translation confirmation:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Traduci pagina</DialogTitle>
          <DialogDescription>
            {isTranslatingAll 
              ? "La pagina verrà tradotta in tutte le lingue (EN, FR, ES, DE) in sequenza" 
              : `Scegli in quale lingua vuoi tradurre la pagina "${page?.title}"`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 my-4">
          {!isTranslatingAll && (
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant={targetLanguage === "en" ? "default" : "outline"}
                onClick={() => setTargetLanguage("en")}
                className={targetLanguage === "en" ? "border-2 border-blue-600" : ""}
              >
                🇬🇧 English
              </Button>
              <Button 
                variant={targetLanguage === "fr" ? "default" : "outline"}
                onClick={() => setTargetLanguage("fr")}
                className={targetLanguage === "fr" ? "border-2 border-blue-600" : ""}
              >
                🇫🇷 Français
              </Button>
              <Button 
                variant={targetLanguage === "es" ? "default" : "outline"}
                onClick={() => setTargetLanguage("es")}
                className={targetLanguage === "es" ? "border-2 border-blue-600" : ""}
              >
                🇪🇸 Español
              </Button>
              <Button 
                variant={targetLanguage === "de" ? "default" : "outline"}
                onClick={() => setTargetLanguage("de")}
                className={targetLanguage === "de" ? "border-2 border-blue-600" : ""}
              >
                🇩🇪 Deutsch
              </Button>
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => setIsTranslatingAll(!isTranslatingAll)}
            className={isTranslatingAll ? "bg-amber-100 border-amber-400 text-amber-800" : ""}
          >
            {isTranslatingAll 
              ? "✅ Tradurre in tutte le lingue (sequenzialmente)" 
              : "Tradurre in tutte le lingue (sequenzialmente)"}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isTranslating}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isTranslating ? "Traduzione in corso..." : "Traduci"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
