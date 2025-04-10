
import React from 'react';
import { motion } from 'framer-motion';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatbotConfig {
  enabled: boolean;
  welcomeMessage: Record<string, string>;
  primaryColor: string;
  secondaryColor: string;
  botName: string;
  position: 'right' | 'left';
  iconType: 'default' | 'custom';
  customIconUrl?: string;
}

interface ChatBoxProps {
  messages: Message[];
  isLoading: boolean;
  config: ChatbotConfig;
  onSendMessage: (message: string) => void;
  onClose: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ 
  messages, 
  isLoading, 
  config, 
  onSendMessage, 
  onClose 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-20 mb-2 w-[340px] rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col bg-white"
      style={{ 
        [config.position === 'left' ? 'left' : 'right']: '20px',
        maxHeight: 'calc(100vh - 160px)',
      }}
    >
      <ChatHeader 
        botName={config.botName}
        primaryColor={config.primaryColor}
        onClose={onClose}
      />

      <ChatMessages 
        messages={messages}
        isLoading={isLoading}
        primaryColor={config.primaryColor}
      />

      <ChatInput 
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        primaryColor={config.primaryColor}
      />
    </motion.div>
  );
};

export default ChatBox;
