
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleHelp, MessageCircle, Globe, RefreshCw } from "lucide-react";

interface WelcomeMessageEditorProps {
  welcomeMessage: Record<string, string>;
  onWelcomeMessageChange: (lang: string, message: string) => void;
  onGenerateAllLanguages: () => Promise<void>;
  isLoading: boolean;
}

const WelcomeMessageEditor: React.FC<WelcomeMessageEditorProps> = ({
  welcomeMessage,
  onWelcomeMessageChange,
  onGenerateAllLanguages,
  isLoading
}) => {
  const [activeLanguage, setActiveLanguage] = useState<'it' | 'en' | 'fr' | 'es' | 'de'>('it');
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-emerald-600" />
          <span>Messaggio di Benvenuto</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="mr-2 h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Lingua:</span>
          </div>
          
          <div className="bg-gray-100 rounded p-2 flex items-center space-x-2 overflow-x-auto">
            {['it', 'en', 'fr', 'es', 'de'].map((lang) => (
              <Button
                key={lang}
                variant={activeLanguage === lang ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveLanguage(lang as 'it' | 'en' | 'fr' | 'es' | 'de')}
                className={activeLanguage === lang ? 'bg-emerald-500 hover:bg-emerald-600' : 'text-xs'}
              >
                {lang.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
        
        <Textarea
          value={welcomeMessage[activeLanguage] || ''}
          onChange={(e) => onWelcomeMessageChange(activeLanguage, e.target.value)}
          placeholder="Inserisci il messaggio di benvenuto per questa lingua..."
          className="min-h-[120px]"
        />
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 flex items-center">
            <CircleHelp className="h-3 w-3 mr-1" />
            <span>Il messaggio di benvenuto verrà mostrato quando l'utente apre il chatbot</span>
          </div>
          
          <Button 
            onClick={onGenerateAllLanguages} 
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                Generazione...
              </>
            ) : (
              <>
                <Globe className="mr-1 h-3 w-3" />
                Genera in Tutte le Lingue
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeMessageEditor;
