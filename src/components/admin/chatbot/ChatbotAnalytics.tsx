
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatbotConversation } from "@/hooks/chatbot/chatbotTypes";
import AnalyticsOverview from "./analytics/AnalyticsOverview";
import ConversationsList from "./analytics/ConversationsList";
import EditResponseDialog from "./analytics/EditResponseDialog";

const ChatbotAnalytics: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<ChatbotConversation | null>(null);
  const [editingResponse, setEditingResponse] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['chatbot-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_stats')
        .select('*')
        .order('date', { ascending: true });
        
      if (error) throw error;
      return data;
    }
  });
  
  const { data: conversations, isLoading: isLoadingConversations, refetch: refetchConversations } = useQuery({
    queryKey: ['chatbot-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return data;
    }
  });
  
  const handleFeedbackUpdate = async (id: string, wasHelpful: boolean) => {
    try {
      const { error } = await supabase
        .from('chatbot_conversations')
        .update({ was_helpful: wasHelpful })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Feedback aggiornato con successo`);
      refetchConversations();
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Errore nell\'aggiornamento del feedback');
    }
  };
  
  const handleEditResponse = (conversation: ChatbotConversation) => {
    setSelectedConversation(conversation);
    setEditingResponse(conversation.corrected_response || conversation.bot_response);
    setIsEditDialogOpen(true);
  };
  
  const handleSaveCorrection = async () => {
    if (!selectedConversation) return;
    
    try {
      const { error } = await supabase
        .from('chatbot_conversations')
        .update({ 
          corrected_response: editingResponse,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);
      
      if (error) throw error;
      toast.success('Risposta corretta salvata con successo');
      setIsEditDialogOpen(false);
      refetchConversations();
    } catch (error) {
      console.error('Error saving correction:', error);
      toast.error('Errore nel salvataggio della correzione');
    }
  };
  
  if (isLoadingStats && isLoadingConversations) {
    return <div className="flex justify-center p-8">Caricamento delle statistiche...</div>;
  }

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center space-x-2 mb-6">
        <Bot className="h-6 w-6 text-emerald-600" />
        <h2 className="text-xl font-medium text-emerald-600">Analisi Chatbot</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistiche e Conversazioni</CardTitle>
          <CardDescription>
            Analisi dettagliata delle interazioni con il chatbot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Panoramica</TabsTrigger>
              <TabsTrigger value="conversations">Conversazioni</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <AnalyticsOverview stats={stats || []} />
            </TabsContent>
            
            <TabsContent value="conversations">
              <div className="bg-white rounded-md">
                {conversations && conversations.length > 0 ? (
                  <ConversationsList
                    conversations={conversations}
                    onUpdateFeedback={handleFeedbackUpdate}
                    onEditResponse={handleEditResponse}
                  />
                ) : (
                  <div className="py-4 text-center text-gray-500">
                    Nessuna conversazione registrata
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EditResponseDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        selectedConversation={selectedConversation}
        editingResponse={editingResponse}
        onEditingResponseChange={setEditingResponse}
        onSave={handleSaveCorrection}
      />
    </div>
  );
};

export default ChatbotAnalytics;
