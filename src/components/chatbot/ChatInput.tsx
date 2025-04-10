
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  primaryColor: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, primaryColor }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-3 border-t border-gray-200 bg-white">
      <div className="flex items-center space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scrivi un messaggio..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading}
          className="h-10 w-10 rounded-full"
          style={{ 
            backgroundColor: message.trim() ? primaryColor : 'transparent',
            color: message.trim() ? 'white' : '#888',
          }}
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
