
import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TranslatedText from "@/components/TranslatedText";

interface PageFullscreenPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  content: React.ReactNode;
  title: string;
  openInNewWindow?: boolean;
}

const PageFullscreenPreview: React.FC<PageFullscreenPreviewProps> = ({
  isOpen,
  onClose,
  content,
  title,
  openInNewWindow = false
}) => {
  // Funzione che gestisce l'apertura in una nuova finestra
  useEffect(() => {
    if (isOpen && openInNewWindow) {
      // Genera HTML per la nuova finestra
      const previewHTML = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 1rem;
              background-color: white;
              border-bottom: 1px solid #e5e7eb;
              position: sticky;
              top: 0;
              z-index: 10;
            }
            .close-button {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 2rem;
              height: 2rem;
              border-radius: 0.375rem;
              background-color: transparent;
              cursor: pointer;
              border: none;
            }
            .close-button:hover {
              background-color: #f3f4f6;
            }
            .content-container {
              padding: 1.5rem;
              background-color: white;
              border-radius: 0.5rem;
              margin: 1rem;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            }
            .prose {
              color: #374151;
              max-width: 65ch;
              margin: 0 auto;
            }
            .prose p {
              margin-bottom: 1.25rem;
              line-height: 1.625;
            }
            .prose h1 {
              font-size: 1.875rem;
              font-weight: 700;
              margin-top: 2rem;
              margin-bottom: 1rem;
            }
            .prose h2 {
              font-size: 1.5rem;
              font-weight: 700;
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
            }
            .prose strong {
              font-weight: 600;
            }
            .prose ul {
              list-style-type: disc;
              padding-left: 1.625rem;
              margin-top: 1.25rem;
              margin-bottom: 1.25rem;
            }
            .prose ol {
              list-style-type: decimal;
              padding-left: 1.625rem;
              margin-top: 1.25rem;
              margin-bottom: 1.25rem;
            }
            .image-placeholder {
              margin: 1.5rem 0;
            }
            .image-placeholder img {
              max-width: 100%;
              height: auto;
              border-radius: 0.375rem;
            }
            .editor-preview-image-left {
              float: left;
              margin-right: 1rem;
              margin-bottom: 1rem;
              max-width: 50%;
            }
            .editor-preview-image-right {
              float: right;
              margin-left: 1rem;
              margin-bottom: 1rem;
              max-width: 50%;
            }
            .editor-preview-image-center {
              display: block;
              margin-left: auto;
              margin-right: auto;
              max-width: 75%;
            }
            .editor-preview-image-full {
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 class="text-lg font-medium flex items-center">
              <span class="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 3h6v6"></path>
                  <path d="M10 14 21 3"></path>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                </svg>
              </span>
              Anteprima: ${title}
            </h2>
            <button class="close-button" id="closeButton">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
          <div class="content-container">
            <div class="prose">
              ${document.querySelector('.prose')?.innerHTML || ''}
            </div>
          </div>

          <script>
            // Elabora i segnaposto di immagine per renderli correttamente
            document.addEventListener('DOMContentLoaded', function() {
              function processImagePlaceholders() {
                const imagePlaceholders = document.querySelectorAll('.prose *');
                
                imagePlaceholders.forEach(el => {
                  if (el.textContent && el.textContent.match(/^\\[📷 [⏺️▶️◀️⬛] .*\\]$/) || el.textContent && el.textContent.match(/^\\[📷 [⏺️▶️◀️⬛].*\\]$/) || el.textContent && el.textContent.match(/^\\[📷.*\\]$/)) {
                    const text = el.textContent;
                    // Tentativo di rilevare diversi formati di segnaposto immagine
                    let matches = text.match(/^\\[📷 ([⏺️▶️◀️⬛]) (.*)\\]$/);
                    
                    if (!matches) {
                      matches = text.match(/^\\[📷 ([⏺️▶️◀️⬛])(.*)\\]$/);
                    }
                    
                    if (!matches) {
                      matches = text.match(/^\\[📷(.*)\\]$/);
                    }
                    
                    if (matches) {
                      // Usiamo il secondo gruppo per il testo della didascalia
                      let position = matches[1] || '⏺️'; // Usa centro come default
                      let caption = matches[2] || 'Immagine';
                      
                      if (!matches[2]) {
                        caption = matches[1] || 'Immagine';
                        position = '⏺️'; // Default al centro
                      }
                      
                      // Mappa posizione a classe CSS
                      const posClass = position === '◀️' ? 'editor-preview-image-left' : 
                                      position === '▶️' ? 'editor-preview-image-right' : 
                                      position === '⬛' ? 'editor-preview-image-full' : 
                                      'editor-preview-image-center';
                      
                      // Recupera gli URL delle immagini dalla finestra originale
                      let imageUrl = '';
                      
                      try {
                        // Cerca nelle immagini delle miniature
                        if (window.opener && !window.opener.closed) {
                          const images = window.opener.document.querySelectorAll('img');
                          
                          for (let img of images) {
                            if ((img.alt === caption || img.alt.includes(caption)) && img.src) {
                              imageUrl = img.src;
                              break;
                            }
                          }
                          
                          // Se non troviamo l'immagine nelle miniature, cerchiamo nell'editor
                          if (!imageUrl) {
                            const originalContent = window.opener.document.querySelector('.prose')?.innerHTML || '';
                            try {
                              const escapedCaption = caption.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                              const imgMatch = originalContent.match(new RegExp('src="([^"]+)".*?' + escapedCaption, 'i'));
                              if (imgMatch && imgMatch[1]) {
                                imageUrl = imgMatch[1];
                              }
                            } catch (regexErr) {
                              console.error("Errore nell'espressione regolare:", regexErr);
                            }
                          }
                          
                          // Cerca anche immagini nella preview della galleria
                          if (!imageUrl) {
                            const previewImages = window.opener.document.querySelectorAll('.image-preview');
                            for (let img of previewImages) {
                              if (img.alt === caption || img.alt.includes(caption)) {
                                imageUrl = img.src;
                                break;
                              }
                            }
                          }
                          
                          // Ultima risorsa: cerca tutte le immagini
                          if (!imageUrl) {
                            const allImages = window.opener.document.querySelectorAll('img');
                            if (allImages.length > 0) {
                              // Prendi la prima immagine disponibile
                              imageUrl = allImages[0].src;
                            }
                          }
                        }
                      } catch (err) {
                        console.error("Errore nel recupero dell'immagine:", err);
                      }
                      
                      // Se abbiamo trovato un URL, mostra l'immagine
                      if (imageUrl) {
                        const imgElement = document.createElement('div');
                        imgElement.className = 'image-placeholder ' + posClass;
                        imgElement.innerHTML = \`
                          <img src="\${imageUrl}" alt="\${caption}" class="image-preview" />
                          <figcaption class="text-sm text-gray-600 text-center mt-2 italic">\${caption}</figcaption>
                        \`;
                        el.parentNode.replaceChild(imgElement, el);
                      } else {
                        // Se non troviamo un URL, aggiungiamo un data attribute per elaborazioni future
                        el.setAttribute('data-image-caption', caption);
                        el.setAttribute('data-image-position', position);
                      }
                    }
                  }
                });
              }
              
              // Processa i segnaposto immediatamente
              processImagePlaceholders();
              
              // Imposta un timer per riprovare a caricare immagini non trovate
              setTimeout(function() {
                const unprocessedImages = document.querySelectorAll('[data-image-caption]');
                if (unprocessedImages.length > 0) {
                  processImagePlaceholders();
                }
              }, 1000);
              
              // Prova più volte a intervalli per caricare immagini
              for (let i = 2; i <= 5; i++) {
                setTimeout(processImagePlaceholders, i * 1000);
              }
            });
            
            document.getElementById('closeButton').addEventListener('click', function() {
              window.close();
            });
          </script>
        </body>
        </html>
      `;

      // Apre una nuova finestra e scrive l'HTML
      const previewWindow = window.open('', '_blank', 'width=1024,height=768');
      if (previewWindow) {
        previewWindow.document.write(previewHTML);
        previewWindow.document.close();
        
        // Chiude il dialog nella pagina principale
        onClose();
        
        // Quando la finestra viene chiusa, esegui onClose
        previewWindow.onbeforeunload = () => {
          onClose();
          return null;
        };
      }
    }
  }, [isOpen, openInNewWindow, content, title, onClose]);

  // Se openInNewWindow è true, non renderiamo il Dialog
  if (openInNewWindow) {
    return null;
  }

  // Altrimenti, mostra il dialog normale
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full w-screen h-screen p-0 overflow-hidden inset-0 m-0 rounded-none border-0 fixed top-0 left-0">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-3 border-b bg-white z-10 sticky top-0">
            <h2 className="text-lg font-medium flex items-center">
              <Maximize2 className="h-4 w-4 mr-2" />
              <TranslatedText text={`Anteprima: ${title}`} />
            </h2>
            <button 
              className="w-8 h-8 rounded-md inline-flex items-center justify-center hover:bg-gray-100 transition-colors"
              onClick={() => onClose()}
              aria-label="Chiudi"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto bg-white">
            <div className="fullscreen-preview-container">
              <div className="fullscreen-preview-content">
                {content}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PageFullscreenPreview;
