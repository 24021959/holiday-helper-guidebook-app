import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart, 
  Pie,
  Cell
} from "recharts";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, HelpCircle, MessageSquare } from "lucide-react";
import { ChatbotConversation, ChatbotStats } from "@/hooks/chatbot/chatbotTypes";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const COLORS = ['#4ade80', '#f87171', '#facc15', '#60a5fa'];

const ChatbotAnalytics: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<ChatbotConversation | null>(null);
  const [editingResponse, setEditingResponse] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['chatbot-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_stats')
        .select('*')
        .order('date', { ascending: true });
        
      if (error) throw error;
      return data as ChatbotStats[];
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
      return data as ChatbotConversation[];
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
  
  const openEditDialog = (conversation: ChatbotConversation) => {
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
    <>
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="conversations">Conversazioni</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Messaggi</CardTitle>
                  <CardDescription>Numero di messaggi per giorno negli ultimi 30 giorni</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {stats && stats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...stats].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total_messages" 
                          stroke="#4ade80" 
                          name="Messaggi"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>Nessun dato disponibile</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Conversazioni</CardTitle>
                  <CardDescription>Numero di conversazioni per giorno</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {stats && stats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[...stats].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                        />
                        <Bar 
                          dataKey="total_conversations" 
                          fill="#60a5fa" 
                          name="Conversazioni"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>Nessun dato disponibile</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Riepilogo Statistiche</CardTitle>
                <CardDescription>Statistiche generali del chatbot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <div className="flex items-center">
                      <MessageSquare className="h-8 w-8 text-emerald-500 mr-3" />
                      <div>
                        <p className="text-sm text-emerald-600 font-medium">Messaggi Totali</p>
                        <p className="text-2xl font-bold text-emerald-700">
                          {stats ? stats.reduce((sum, day) => sum + (day.total_messages || 0), 0) : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center">
                      <MessageSquare className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Conversazioni Totali</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {stats ? stats.reduce((sum, day) => sum + (day.total_conversations || 0), 0) : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                    <div className="flex items-center">
                      <HelpCircle className="h-8 w-8 text-amber-500 mr-3" />
                      <div>
                        <p className="text-sm text-amber-600 font-medium">Messaggi per Conversazione</p>
                        <p className="text-2xl font-bold text-amber-700">
                          {stats && stats.length > 0 
                            ? (stats.reduce((sum, day) => sum + (day.total_messages || 0), 0) / 
                               stats.reduce((sum, day) => sum + (day.total_conversations || 0), 0)).toFixed(1) 
                            : '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="conversations">
            <Card>
              <CardHeader>
                <CardTitle>Conversazioni Recenti</CardTitle>
                <CardDescription>Le ultime 50 conversazioni con il chatbot</CardDescription>
              </CardHeader>
              <CardContent>
                {conversations && conversations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Data e ora</TableHead>
                        <TableHead>Domanda utente</TableHead>
                        <TableHead>Risposta chatbot</TableHead>
                        <TableHead className="w-[120px]">Feedback</TableHead>
                        <TableHead className="w-[100px]">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conversations.map((conv) => (
                        <TableRow key={conv.id}>
                          <TableCell className="font-medium">
                            {format(new Date(conv.created_at), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                          <TableCell className="max-w-[250px] truncate">
                            {conv.user_message}
                          </TableCell>
                          <TableCell className="max-w-[250px] truncate">
                            {conv.corrected_response || conv.bot_response}
                            {conv.corrected_response && (
                              <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                                Corretto
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                variant={conv.was_helpful === true ? "default" : "outline"} 
                                size="icon" 
                                className={`h-8 w-8 ${conv.was_helpful === true ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                                onClick={() => handleFeedbackUpdate(conv.id, true)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant={conv.was_helpful === false ? "default" : "outline"} 
                                size="icon" 
                                className={`h-8 w-8 ${conv.was_helpful === false ? "bg-red-500 hover:bg-red-600" : ""}`}
                                onClick={() => handleFeedbackUpdate(conv.id, false)}
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(conv)}
                            >
                              Correggi
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-4 text-center text-gray-500">
                    Nessuna conversazione registrata
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {isEditDialogOpen && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Correggi risposta del chatbot</DialogTitle>
              <DialogDescription>
                Modifica la risposta del chatbot per migliorare la qualità delle risposte future.
              </DialogDescription>
            </DialogHeader>
            
            {selectedConversation && (
              <div className="space-y-4 py-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Domanda dell'utente:</h4>
                  <div className="p-3 bg-gray-50 rounded-md border text-gray-700">
                    {selectedConversation.user_message}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Risposta originale:</h4>
                  <div className="p-3 bg-gray-50 rounded-md border text-gray-700">
                    {selectedConversation.bot_response}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Risposta corretta:</h4>
                  <Textarea
                    value={editingResponse}
                    onChange={(e) => setEditingResponse(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Questa correzione verrà usata per migliorare le risposte future del chatbot.
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annulla
              </Button>
              <Button onClick={handleSaveCorrection}>
                Salva correzione
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ChatbotAnalytics;
