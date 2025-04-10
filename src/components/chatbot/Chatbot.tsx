
import React, { useState, useRef, useEffect } from 'react';
import { useChatbot } from '@/hooks/useChatbot';
import { Send, Bot, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const Chatbot: React.FC<{ previewConfig?: any }> = ({ previewConfig }) => {
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    config, 
    closeChat
  } = useChatbot(previewConfig);
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    sendMessage(input);
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Auto resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-[600px] max-h-[calc(100vh-100px)] w-full flex-col overflow-hidden rounded-lg bg-white shadow-xl">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4"
        style={{ backgroundColor: config.primaryColor }}
      >
        <div className="flex items-center">
          <Bot className="mr-2 h-5 w-5 text-white" />
          <h3 className="font-medium text-white">{config.botName}</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={closeChat}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-gray-100 text-gray-800'
                  : 'border-l-4 bg-white shadow-sm'
              }`}
              style={
                message.role === 'assistant'
                  ? { borderColor: config.primaryColor }
                  : {}
              }
            >
              {message.role === 'assistant' && (
                <div 
                  className="text-xs font-medium mb-1"
                  style={{ color: config.primaryColor }}
                >
                  {config.botName}
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div 
              className="border-l-4 max-w-[80%] rounded-lg p-3 bg-white shadow-sm"
              style={{ borderColor: config.primaryColor }}
            >
              <div 
                className="text-xs font-medium mb-1"
                style={{ color: config.primaryColor }}
              >
                {config.botName}
              </div>
              <div className="flex items-center text-sm">
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Sto scrivendo...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-end space-x-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi il tuo messaggio..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            style={{ backgroundColor: config.primaryColor }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;
