
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bot, Settings2 } from "lucide-react";

// Import custom hooks
import { useChatbotConfig } from "./chatbot/useChatbotConfig";

// Import component parts
import GeneralSettings from "./chatbot/GeneralSettings";
import WelcomeMessageEditor from "./chatbot/WelcomeMessageEditor";
import ChatbotPreview from "./chatbot/ChatbotPreview";
import KnowledgeBaseUpdater from "./chatbot/KnowledgeBaseUpdater";
import ChatbotPreviewDialog from "./chatbot/ChatbotPreviewDialog";

const ChatbotSettings: React.FC = () => {
  const { isLoading, isSaving, chatbotConfig, setChatbotConfig, saveChatbotConfig } = useChatbotConfig();
  const [activeLanguage, setActiveLanguage] = useState<'it' | 'en' | 'fr' | 'es' | 'de'>('it');
  
  const handleSave = async () => {
    await saveChatbotConfig(chatbotConfig);
  };

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-medium text-emerald-600">Impostazioni Chatbot</h2>
        </div>
        
        <ChatbotPreviewDialog config={chatbotConfig} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <GeneralSettings 
            config={chatbotConfig} 
            onConfigChange={setChatbotConfig} 
          />
          
          <KnowledgeBaseUpdater 
            isLoading={isLoading} 
            setIsLoading={(loading) => setChatbotConfig(prev => ({ ...prev }))} 
          />
        </div>

        <div className="space-y-6">
          <WelcomeMessageEditor 
            config={chatbotConfig}
            onConfigChange={setChatbotConfig}
            isLoading={isLoading}
            setIsLoading={(loading) => setChatbotConfig(prev => ({ ...prev }))}
          />

          <ChatbotPreview 
            config={chatbotConfig} 
            welcomeMessage={chatbotConfig.welcomeMessage[activeLanguage] || ''} 
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <Settings2 className="mr-2 h-4 w-4" />
          {isSaving ? "Salvataggio..." : "Salva Impostazioni"}
        </Button>
      </div>
    </div>
  );
};

export default ChatbotSettings;
