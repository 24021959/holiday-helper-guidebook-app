
import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  primaryColor: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading, primaryColor }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} botColor={primaryColor} />
      ))}
      
      {isLoading && (
        <div className="flex justify-start mb-3">
          <div className="flex items-start max-w-[80%]">
            <Avatar className="mr-2 h-8 w-8 mt-1">
              <AvatarFallback style={{ backgroundColor: primaryColor }}>
                <Bot size={16} className="text-white" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin text-gray-400" />
                <span className="text-sm text-gray-500">Scrivendo...</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
