
import React from 'react';
import { Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  botColor: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, botColor }) => {
  return (
    <div
      className={`mb-3 flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div className="flex items-start max-w-[80%]">
        {message.role === 'assistant' && (
          <Avatar className="mr-2 h-8 w-8 mt-1">
            <AvatarFallback style={{ backgroundColor: botColor }}>
              <Bot size={16} className="text-white" />
            </AvatarFallback>
          </Avatar>
        )}
        <div
          className={`rounded-lg p-3 text-left ${
            message.role === 'user'
              ? 'bg-gray-200 text-gray-800'
              : 'bg-white border border-gray-200'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <div
            className={`text-xs mt-1 ${
              message.role === 'user' ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
        {message.role === 'user' && (
          <Avatar className="ml-2 h-8 w-8 mt-1">
            <AvatarFallback className="bg-gray-500">
              <User size={16} className="text-white" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
