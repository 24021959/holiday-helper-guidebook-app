
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';

interface WelcomeMessageEditorProps {
  welcomeMessage: Record<string, string>;
  onWelcomeMessageChange: (language: string, message: string) => void;
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
  const [currentMessage, setCurrentMessage] = useState('');
  const { translateBulk } = useTranslation();
  
  useEffect(() => {
    setCurrentMessage(welcomeMessage[activeLanguage] || '');
  }, [activeLanguage, welcomeMessage]);
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
    onWelcomeMessageChange(activeLanguage, e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center">
          <Globe className="h-5 w-5 mr-2 text-emerald-600" />
          Messaggio di Benvenuto
        </h3>
        
        <div className="flex items-center">
          <Button
            onClick={onGenerateAllLanguages}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Globe className="mr-1 h-3 w-3" />
            Genera in Tutte le Lingue
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label className="flex-shrink-0">Lingua:</Label>
          <div className="bg-gray-100 rounded p-2 flex items-center space-x-2 overflow-x-auto w-full">
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
          value={currentMessage}
          onChange={handleMessageChange}
          placeholder="Inserisci il messaggio di benvenuto per questa lingua..."
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default WelcomeMessageEditor;
