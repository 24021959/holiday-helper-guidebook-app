
import React from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  botName: string;
  primaryColor: string;
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ botName, primaryColor, onClose }) => {
  return (
    <div 
      className="flex items-center justify-between p-3 text-white"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="flex items-center space-x-2">
        <Bot size={18} />
        <span className="font-medium">{botName}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X size={18} />
      </Button>
    </div>
  );
};

export default ChatHeader;
