
import React, { useState, useRef, useEffect } from 'react';
import { useChatbot } from '@/hooks/useChatbot';
import { Send, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ChatMessages from './ChatMessages';
import ChatHeader from './ChatHeader';
import { toast } from "sonner";

const Chatbot: React.FC<{ previewConfig?: any }> = ({ previewConfig }) => {
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    config, 
    closeChat,
    knowledgeBaseExists,
    knowledgeBaseCount
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
    
    try {
      sendMessage(input);
      setInput('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Errore nell'invio del messaggio. Riprova più tardi.");
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
      <ChatHeader 
        botName={config.botName}
        primaryColor={config.primaryColor}
        onClose={closeChat}
      />
      
      {knowledgeBaseExists === false && !previewConfig && (
        <Alert variant="destructive" className="m-2 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-xs text-amber-800">
            La base di conoscenza del chatbot è vuota. Assicurati di averla aggiornata dalle impostazioni del chatbot.
          </AlertDescription>
        </Alert>
      )}
      
      <ChatMessages 
        messages={messages}
        isLoading={isLoading}
        primaryColor={config.primaryColor}
        messagesEndRef={messagesEndRef}
      />
      
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
