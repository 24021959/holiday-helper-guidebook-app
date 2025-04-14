
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatbotConversation } from "@/hooks/chatbot/chatbotTypes";

interface EditResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedConversation: ChatbotConversation | null;
  editingResponse: string;
  onEditingResponseChange: (value: string) => void;
  onSave: () => void;
}

const EditResponseDialog: React.FC<EditResponseDialogProps> = ({
  isOpen,
  onClose,
  selectedConversation,
  editingResponse,
  onEditingResponseChange,
  onSave,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                onChange={(e) => onEditingResponseChange(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Questa correzione verrà usata per migliorare le risposte future del chatbot.
              </p>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={onSave}>
            Salva correzione
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditResponseDialog;
