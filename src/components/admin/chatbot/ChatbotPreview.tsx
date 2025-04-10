
import React from "react";
import { Bot } from "lucide-react";
import { type ChatbotConfig } from "./useChatbotConfig";

interface ChatbotPreviewProps {
  config: ChatbotConfig;
  welcomeMessage: string;
}

const ChatbotPreview: React.FC<ChatbotPreviewProps> = ({ config, welcomeMessage }) => {
  return (
    <div className="space-y-4 bg-gray-50 border rounded-lg p-4">
      <h3 className="text-lg font-medium">Anteprima</h3>
      <div className="relative p-5 border rounded-lg bg-white shadow-sm min-h-[250px]">
        <div 
          className="absolute bottom-4 right-4 rounded-full w-14 h-14 flex items-center justify-center shadow-md" 
          style={{ backgroundColor: config.primaryColor, color: config.secondaryColor }}
        >
          <Bot className="h-6 w-6" />
        </div>
        <div 
          className="absolute bottom-20 right-4 max-w-xs bg-white rounded-lg shadow-md p-3 border-l-4" 
          style={{ borderColor: config.primaryColor }}
        >
          <div className="text-xs font-medium mb-1" style={{ color: config.primaryColor }}>
            {config.botName}
          </div>
          <p className="text-sm text-gray-700">{welcomeMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPreview;
