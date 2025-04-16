
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Globe, Plus, X } from "lucide-react";
import { ChatbotConfig } from "@/hooks/chatbot/chatbotTypes";

interface SuggestedQuestionsProps {
  config: ChatbotConfig;
  onConfigChange: (field: keyof ChatbotConfig, value: any) => void;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ config, onConfigChange }) => {
  const [activeLanguage, setActiveLanguage] = useState<'it' | 'en' | 'fr' | 'es' | 'de'>('it');
  const [newQuestion, setNewQuestion] = useState('');

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;

    const updatedQuestions = {
      ...config.suggestedQuestions,
      [activeLanguage]: [...(config.suggestedQuestions?.[activeLanguage] || []), newQuestion.trim()]
    };
    onConfigChange('suggestedQuestions', updatedQuestions);
    setNewQuestion('');
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = {
      ...config.suggestedQuestions,
      [activeLanguage]: (config.suggestedQuestions?.[activeLanguage] || []).filter((_, i) => i !== index)
    };
    onConfigChange('suggestedQuestions', updatedQuestions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HelpCircle className="h-5 w-5 text-emerald-600" />
          <span>Domande Suggerite</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Lingua:</span>
          </div>
          
          <div className="flex space-x-2">
            {(['it', 'en', 'fr', 'es', 'de'] as const).map((lang) => (
              <Button
                key={lang}
                variant={activeLanguage === lang ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveLanguage(lang)}
                className={activeLanguage === lang ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
              >
                {lang.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <Input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Aggiungi una nuova domanda suggerita..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
          />
          <Button onClick={handleAddQuestion} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {(config.suggestedQuestions?.[activeLanguage] || []).map((question, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">{question}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveQuestion(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestedQuestions;
