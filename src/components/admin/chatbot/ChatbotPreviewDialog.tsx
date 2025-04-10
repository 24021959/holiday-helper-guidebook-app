
import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare } from "lucide-react";
import Chatbot from "@/components/Chatbot";
import { type ChatbotConfig } from "./useChatbotConfig";

interface ChatbotPreviewDialogProps {
  config: ChatbotConfig;
}

const ChatbotPreviewDialog: React.FC<ChatbotPreviewDialogProps> = ({ config }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Anteprima Chatbot
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl">
        <div className="h-full flex flex-col">
          <h3 className="text-lg font-medium my-4">Anteprima Chatbot</h3>
          <div className="flex-1 bg-gray-100 rounded-lg p-4 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500 italic">
                Questa è un'anteprima del chatbot con le impostazioni attuali
              </p>
            </div>
            <Chatbot previewConfig={config} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatbotPreviewDialog;
