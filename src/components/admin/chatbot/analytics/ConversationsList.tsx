
import React from 'react';
import { format } from "date-fns";
import { ChatbotConversation } from "@/hooks/chatbot/chatbotTypes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ConversationsListProps {
  conversations: ChatbotConversation[];
  onUpdateFeedback: (id: string, wasHelpful: boolean) => void;
  onEditResponse: (conversation: ChatbotConversation) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  onUpdateFeedback,
  onEditResponse,
}) => {
  return (
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
                  onClick={() => onUpdateFeedback(conv.id, true)}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant={conv.was_helpful === false ? "default" : "outline"} 
                  size="icon" 
                  className={`h-8 w-8 ${conv.was_helpful === false ? "bg-red-500 hover:bg-red-600" : ""}`}
                  onClick={() => onUpdateFeedback(conv.id, false)}
                >
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
            <TableCell>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEditResponse(conv)}
              >
                Correggi
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ConversationsList;
