
import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ChatbotBubble: React.FC = () => {
  const [chatbotCode, setChatbotCode] = useState<string | null>(null);

  useEffect(() => {
    // Recupera il codice del chatbot dal localStorage
    const savedChatbotCode = localStorage.getItem("chatbotCode");
    setChatbotCode(savedChatbotCode);
    
    // Se esiste un codice chatbot configurato, lo utilizziamo
    if (savedChatbotCode) {
      // Estrai l'URL dello script dal codice
      const srcMatch = savedChatbotCode.match(/src=['"](.*?)['"]/);
      const dataIdMatch = savedChatbotCode.match(/data-chatbot-id=['"](.*?)['"]/);
      
      if (srcMatch && srcMatch[1]) {
        const scriptSrc = srcMatch[1];
        let chatbotId = "";
        
        if (dataIdMatch && dataIdMatch[1]) {
          chatbotId = dataIdMatch[1];
        }
        
        // Verifica se il tag script è già stato aggiunto
        if (!document.getElementById("chatbot-script")) {
          // Aggiungi lo script del chatbot nel tag HEAD
          const script = document.createElement("script");
          script.id = "chatbot-script";
          script.defer = true;
          script.src = scriptSrc;
          
          if (chatbotId) {
            script.setAttribute("data-chatbot-id", chatbotId);
          }
          script.setAttribute("data-element", "chatbot-container");
          script.setAttribute("data-position", "right");
          
          // Inserisci lo script nell'head
          document.head.appendChild(script);
          console.log("Script del chatbot aggiunto nell'head del documento");
        }
      }
    } else {
      // Se non c'è un codice configurato, utilizziamo quello predefinito
      if (!document.getElementById("chatbot-script")) {
        const script = document.createElement("script");
        script.id = "chatbot-script";
        script.defer = true;
        script.src = "https://cdn.aichatbotjs.com/chatbot.js";
        script.setAttribute("data-chatbot-id", "bot-ufqmgj3gyj");
        script.setAttribute("data-element", "chatbot-container");
        script.setAttribute("data-position", "right");
        
        document.head.appendChild(script);
        console.log("Script del chatbot predefinito aggiunto nell'head");
      }
    }
    
    // Aggiungi un container per il chatbot se non esiste
    if (!document.getElementById("chatbot-container")) {
      const chatbotContainer = document.createElement("div");
      chatbotContainer.id = "chatbot-container";
      document.body.appendChild(chatbotContainer);
    }
    
    // Funzione di pulizia
    return () => {
      // Non rimuoviamo lo script perché potrebbe causare problemi durante la navigazione SPA
    };
  }, []);

  const handleOpenChat = () => {
    console.log("Tentativo di aprire il chatbot...");
    
    try {
      // Emetti eventi personalizzati che il chatbot potrebbe ascoltare
      const openEvent = new CustomEvent("open-chatbot");
      window.dispatchEvent(openEvent);
      
      // Cerca elementi del DOM che potrebbero essere il chatbot
      const chatbotElements = [
        document.querySelector(".chatbot-widget"),
        document.querySelector(".chatbot-launcher"),
        document.querySelector("iframe[id*='chatbot']"),
        document.querySelector("[data-botid]"),
        document.querySelector("[id*='chatbot']"),
        document.querySelector("[class*='chatbot']")
      ];
      
      // Prova a cliccare o mostrare il primo elemento chatbot trovato
      for (const element of chatbotElements) {
        if (element) {
          console.log("Elemento chatbot trovato, tentativo di apertura:", element);
          if (element instanceof HTMLElement) {
            element.click();
            element.style.display = "block";
            element.style.visibility = "visible";
            element.style.opacity = "1";
            return;
          }
        }
      }
      
      // Se non troviamo un elemento chatbot, ricarica il chatbot
      console.log("Nessun elemento chatbot trovato, ricarico lo script");
      const existingScript = document.getElementById("chatbot-script");
      if (existingScript) {
        existingScript.remove();
      }
      
      // Recupera il codice più recente
      const latestChatbotCode = localStorage.getItem("chatbotCode");
      if (latestChatbotCode) {
        // Estrai l'URL dello script dal codice
        const srcMatch = latestChatbotCode.match(/src=['"](.*?)['"]/);
        const dataIdMatch = latestChatbotCode.match(/data-chatbot-id=['"](.*?)['"]/);
        
        if (srcMatch && srcMatch[1]) {
          const scriptSrc = srcMatch[1];
          const script = document.createElement("script");
          script.id = "chatbot-script";
          script.defer = true;
          script.src = scriptSrc;
          
          if (dataIdMatch && dataIdMatch[1]) {
            script.setAttribute("data-chatbot-id", dataIdMatch[1]);
          }
          
          script.setAttribute("data-element", "chatbot-container");
          script.setAttribute("data-position", "right");
          document.head.appendChild(script);
        }
      } else {
        // Utilizza configurazione predefinita
        const script = document.createElement("script");
        script.id = "chatbot-script";
        script.defer = true;
        script.src = "https://cdn.aichatbotjs.com/chatbot.js";
        script.setAttribute("data-chatbot-id", "bot-ufqmgj3gyj");
        script.setAttribute("data-element", "chatbot-container");
        script.setAttribute("data-position", "right");
        document.head.appendChild(script);
      }
      
      // Mostra messaggio all'utente
      toast({
        title: "Chatbot in caricamento",
        description: "Il chatbot sta per aprirsi, attendi un momento...",
        duration: 3000
      });
    } catch (error) {
      console.error("Errore durante l'apertura del chatbot:", error);
      toast({
        title: "Errore chatbot",
        description: "Impossibile aprire il chatbot. Riprova più tardi.",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <button 
          className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
          aria-label="Chatta con noi"
          title="Chatta con noi"
          onClick={handleOpenChat}
        >
          <MessageCircle size={24} />
        </button>
      </div>
    </>
  );
};

// Aggiungi questo per TypeScript
declare global {
  interface Window {
    ChatbotComponent?: {
      open?: () => void;
      toggle?: () => void;
    };
    openChatbot?: () => void;
  }
}

export default ChatbotBubble;
