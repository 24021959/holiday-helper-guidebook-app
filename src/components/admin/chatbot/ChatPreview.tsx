
import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import Chatbot from "@/components/chatbot/Chatbot";
import { ChatbotConfig } from "@/hooks/chatbot/chatbotTypes";

interface ChatPreviewProps {
  previewConfig: ChatbotConfig;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({ previewConfig }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <MessageSquare className="mr-2 h-4 w-4" />
          Anteprima Chatbot
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-lg">
        <div className="h-full flex flex-col">
          <h3 className="text-lg font-medium mb-4">Anteprima Chatbot</h3>
          <div className="flex-1">
            <Chatbot previewConfig={previewConfig} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatPreview;
