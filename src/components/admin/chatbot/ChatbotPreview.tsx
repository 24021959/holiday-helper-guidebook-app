
import React from 'react';
import { Bot } from 'lucide-react';

interface ChatbotPreviewProps {
  primaryColor: string;
  botName: string;
  welcomeMessage: string;
}

const ChatbotPreview: React.FC<ChatbotPreviewProps> = ({
  primaryColor,
  botName,
  welcomeMessage
}) => {
  return (
    <div className="space-y-4 bg-gray-50 border rounded-lg p-4">
      <h3 className="text-lg font-medium">Anteprima</h3>
      <div className="relative p-5 border rounded-lg bg-white shadow-sm min-h-[250px]">
        <div 
          className="absolute bottom-4 right-4 bg-emerald-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-md" 
          style={{ backgroundColor: primaryColor }}
        >
          <Bot className="h-6 w-6" />
        </div>
        <div 
          className="absolute bottom-20 right-4 max-w-xs bg-white rounded-lg shadow-md p-3 border-l-4" 
          style={{ borderColor: primaryColor }}
        >
          <div 
            className="text-xs font-medium mb-1" 
            style={{ color: primaryColor }}
          >
            {botName}
          </div>
          <p className="text-sm text-gray-700">{welcomeMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPreview;
