
import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "@/components/ui/toast";

const ChatbotBubble: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [chatbotAttempts, setChatbotAttempts] = useState(0);

  useEffect(() => {
    // Rimuovi script esistenti per evitare duplicati
    const existingScript = document.getElementById("chatbot-script");
    if (existingScript) {
      existingScript.remove();
    }

    // Carica lo script del chatbot
    const script = document.createElement("script");
    script.defer = true;
    script.id = "chatbot-script";
    script.src = "https://cdn.aichatbotjs.com/chatbot.js";
    script.setAttribute("data-chatbot-id", "bot-ufqmgj3gyj");
    
    // Configurazioni aggiuntive che potrebbero essere necessarie
    script.setAttribute("data-element", "chatbot-container");
    script.setAttribute("data-position", "right");
    
    // Imposta event listener per sapere quando il chatbot è pronto
    script.onload = () => {
      console.log("Script del chatbot caricato, attendo inizializzazione...");
      
      // Controlla periodicamente se il chatbot è disponibile
      const checkChatbotInterval = setInterval(() => {
        if (
          window.ChatbotComponent ||
          window.openChatbot ||
          document.querySelector(".chatbot-widget") ||
          document.querySelector(".chatbot-launcher")
        ) {
          console.log("Chatbot disponibile e pronto all'uso");
          clearInterval(checkChatbotInterval);
          setIsLoaded(true);
        } else {
          setChatbotAttempts(prev => {
            if (prev > 20) { // Termina dopo 20 tentativi (10 secondi)
              clearInterval(checkChatbotInterval);
              console.error("Impossibile rilevare il chatbot dopo diversi tentativi");
            }
            return prev + 1;
          });
        }
      }, 500);
    };
    
    // Crea un container per il chatbot (alcuni chatbot lo richiedono)
    const chatbotContainer = document.createElement("div");
    chatbotContainer.id = "chatbot-container";
    document.body.appendChild(chatbotContainer);
    
    // Aggiungi lo script al body
    document.body.appendChild(script);
    
    // Funzione di pulizia
    return () => {
      const existingScript = document.getElementById("chatbot-script");
      if (existingScript) {
        existingScript.remove();
      }
      
      const container = document.getElementById("chatbot-container");
      if (container) {
        container.remove();
      }
    };
  }, []);

  const handleOpenChat = () => {
    console.log("Tentativo di aprire il chatbot...");
    
    // Prova diversi metodi conosciuti per aprire il chatbot
    try {
      if (window.ChatbotComponent?.open) {
        console.log("Apertura del chatbot via ChatbotComponent.open()");
        window.ChatbotComponent.open();
        return;
      } 
      
      if (window.ChatbotComponent?.toggle) {
        console.log("Apertura del chatbot via ChatbotComponent.toggle()");
        window.ChatbotComponent.toggle();
        return;
      }
      
      if (window.openChatbot) {
        console.log("Apertura del chatbot via openChatbot()");
        window.openChatbot();
        return;
      }
      
      // Cerca elementi del DOM che potrebbero essere il chatbot
      const chatbotLauncher = document.querySelector(".chatbot-launcher") as HTMLElement;
      if (chatbotLauncher) {
        console.log("Apertura del chatbot via chatbot-launcher element click");
        chatbotLauncher.click();
        return;
      }
      
      const chatbotWidget = document.querySelector(".chatbot-widget") as HTMLElement;
      if (chatbotWidget) {
        console.log("Apertura del chatbot via chatbot-widget");
        chatbotWidget.style.display = "block";
        return;
      }
      
      const chatbotIframe = document.querySelector("iframe[id*='chatbot']") as HTMLElement;
      if (chatbotIframe) {
        console.log("Apertura del chatbot via iframe");
        chatbotIframe.style.display = "block";
        return;
      }
      
      // Invia un evento personalizzato che il chatbot potrebbe ascoltare
      console.log("Invio di eventi personalizzati per l'apertura del chatbot");
      ["open-chatbot", "toggle-chatbot", "show-chatbot", "chatbot-open"].forEach(eventName => {
        window.dispatchEvent(new CustomEvent(eventName));
      });
      
      // Come ultima risorsa, ricarica lo script
      if (!isLoaded) {
        console.log("Ricaricamento dello script del chatbot...");
        const existingScript = document.getElementById("chatbot-script");
        if (existingScript) {
          existingScript.remove();
        }
        const script = document.createElement("script");
        script.defer = true;
        script.id = "chatbot-script";
        script.src = "https://cdn.aichatbotjs.com/chatbot.js";
        script.setAttribute("data-chatbot-id", "bot-ufqmgj3gyj");
        script.setAttribute("data-element", "chatbot-container");
        script.setAttribute("data-position", "right");
        document.body.appendChild(script);
      }
    } catch (error) {
      console.error("Errore durante l'apertura del chatbot:", error);
      toast({
        title: "Errore chatbot",
        description: "Impossibile aprire il chatbot. Riprova più tardi.",
        variant: "destructive"
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
