
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Anteprima del Chatbot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative p-5 border rounded-lg bg-white shadow-sm min-h-[220px]">
          <div className="absolute bottom-4 right-4 rounded-full w-14 h-14 flex items-center justify-center shadow-md" 
               style={{ backgroundColor: primaryColor }}>
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="absolute bottom-20 right-4 max-w-xs bg-white rounded-lg shadow-md p-3 border-l-4" 
               style={{ borderColor: primaryColor }}>
            <div className="text-xs font-medium mb-1" style={{ color: primaryColor }}>
              {botName}
            </div>
            <p className="text-sm text-gray-700">{welcomeMessage}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotPreview;
