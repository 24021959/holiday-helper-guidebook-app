
import { toast } from "sonner";

export const useSpecialInserts = (
  content: string,
  cursorPosition: number | null,
  onChange: (content: string) => void,
  updateHistory: (content: string) => void
) => {
  // Insert content at cursor position
  const insertAtCursor = (text: string) => {
    if (cursorPosition === null) {
      // If no cursor position, append to end
      const newContent = content.trim() ? `${content}\n\n${text}` : text;
      onChange(newContent);
      updateHistory(newContent);
      return;
    }
    
    const newContent = 
      content.substring(0, cursorPosition) + 
      text + 
      content.substring(cursorPosition);
    
    onChange(newContent);
    updateHistory(newContent);
  };

  // Handle phone number insertion
  const handlePhoneInsert = () => {
    const phoneNumber = prompt("Inserisci il numero di telefono (formato: +39 123 456 7890):");
    if (!phoneNumber) {
      return;
    }
    
    const label = prompt("Inserisci l'etichetta per il numero di telefono:", phoneNumber);
    
    const formattedPhone = phoneNumber.replace(/\s+/g, '');
    insertAtCursor(`[PHONE:${formattedPhone}:${label || phoneNumber}]`);
    
    toast.success("Numero di telefono aggiunto con successo");
  };

  // Handle map insertion
  const handleMapInsert = () => {
    const mapUrl = prompt("Inserisci l'URL di Google Maps:");
    if (!mapUrl) {
      return;
    }
    
    const label = prompt("Inserisci l'etichetta per la posizione:", "Visualizza su Google Maps");
    
    insertAtCursor(`[MAP:${mapUrl}:${label || "Visualizza su Google Maps"}]`);
    
    toast.success("Link a Google Maps aggiunto con successo");
  };

  return {
    handlePhoneInsert,
    handleMapInsert
  };
};
