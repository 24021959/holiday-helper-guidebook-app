
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { 
  ImageIcon, MapPin, Phone, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Type, List, ListOrdered, Heading1, Heading2,
  Link as LinkIcon, Undo, Redo, Eye, Trash2, Move, Edit2, Maximize2, 
  ArrowUpRight, PanelLeft, PanelRight, X, Plus, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ImageInsertionDialog from './form/ImageInsertionDialog';

interface ImageDetail {
  url: string;
  width: string;
  position: "left" | "center" | "right" | "full";
  caption?: string;
}

interface VisualEditorProps {
  content: string;
  images: ImageDetail[];
  onChange: (content: string) => void;
  onImageAdd: (image: ImageDetail) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  content,
  images,
  onChange,
  onImageAdd
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageDetail | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editMode, setEditMode] = useState<'visual' | 'preview'>('visual');
  const [editHistory, setEditHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showImageControls, setShowImageControls] = useState<number | null>(null);
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [formattedPreview, setFormattedPreview] = useState<string>('');
  const [selectedText, setSelectedText] = useState<{start: number, end: number, text: string} | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);

  // Format the content for preview
  useEffect(() => {
    const formatContent = () => {
      let formatted = content || '';
      
      // Replace image placeholders with actual images
      images.forEach((image, index) => {
        const positionClass = 
          image.position === "left" ? "float-left mr-4" : 
          image.position === "right" ? "float-right ml-4" : 
          image.position === "full" ? "w-full block" : 
          "mx-auto block";
        
        const placeholder = `[IMAGE_${index}]`;
        const imageHtml = `
          <figure class="${positionClass}" style="width: ${image.width}; margin-bottom: 1rem;">
            <img 
              src="${image.url}" 
              alt="${image.caption || `Image ${index+1}`}" 
              class="w-full h-auto rounded-md" 
              data-image-index="${index}"
            />
            ${image.caption ? `<figcaption class="text-sm text-gray-500 mt-1">${image.caption}</figcaption>` : ''}
          </figure>
        `;
        
        formatted = formatted.replace(placeholder, imageHtml);
      });
      
      // Convert markdown-like formatting to HTML
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      formatted = formatted.replace(/__(.*?)__/g, '<u>$1</u>');
      
      // Convert phone numbers
      formatted = formatted.replace(/\[PHONE:(.*?):(.*?)\]/g, 
        '<a href="tel:$1" class="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200">' +
        '<span class="mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></span>' +
        '$2</a>');
      
      // Convert location/maps
      formatted = formatted.replace(/\[MAP:(.*?):(.*?)\]/g, 
        '<a href="$1" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">' +
        '<span class="mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>' +
        '$2</a>');
      
      // Convert headings
      formatted = formatted.replace(/## (.*?)(?:\n|$)/g, '<h2 class="text-xl font-bold my-3">$1</h2>');
      formatted = formatted.replace(/# (.*?)(?:\n|$)/g, '<h1 class="text-2xl font-bold my-4">$1</h1>');
      
      // Convert lists
      let bulletListRegex = /- (.*?)(?:\n|$)/g;
      let match;
      let listItems = [];
      
      while ((match = bulletListRegex.exec(formatted)) !== null) {
        listItems.push(`<li>${match[1]}</li>`);
      }
      
      if (listItems.length > 0) {
        const list = `<ul class="list-disc pl-5 my-2">${listItems.join('')}</ul>`;
        formatted = formatted.replace(/- .*?(?:\n|$)/g, '');
        formatted = formatted.replace(/BULLETS_PLACEHOLDER/, list);
      } else {
        formatted = formatted.replace(/BULLETS_PLACEHOLDER/, '');
      }
      
      // Alignment classes
      formatted = formatted.replace(/\[ALIGN:left\](.*?)\[\/ALIGN\]/gs, '<div class="text-left">$1</div>');
      formatted = formatted.replace(/\[ALIGN:center\](.*?)\[\/ALIGN\]/gs, '<div class="text-center">$1</div>');
      formatted = formatted.replace(/\[ALIGN:right\](.*?)\[\/ALIGN\]/gs, '<div class="text-right">$1</div>');
      formatted = formatted.replace(/\[ALIGN:justify\](.*?)\[\/ALIGN\]/gs, '<div class="text-justify">$1</div>');
      
      // Handle line breaks
      formatted = formatted.replace(/\n/g, '<br />');
      
      return formatted;
    };
    
    setFormattedPreview(formatContent());
  }, [content, images]);

  // Update history when content changes
  useEffect(() => {
    if (content !== editHistory[historyIndex]) {
      const newHistory = editHistory.slice(0, historyIndex + 1);
      newHistory.push(content);
      setEditHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [content]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(editHistory[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < editHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(editHistory[newIndex]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'immagine è troppo grande. Il limite è 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setShowImageDialog(true);
          const imageUrl = event.target.result as string;
          setSelectedImage({
            url: imageUrl,
            width: "50%",
            position: "center"
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextareaSelect = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
      
      if (textareaRef.current.selectionStart !== textareaRef.current.selectionEnd) {
        setSelectedText({
          start: textareaRef.current.selectionStart,
          end: textareaRef.current.selectionEnd,
          text: textareaRef.current.value.substring(
            textareaRef.current.selectionStart,
            textareaRef.current.selectionEnd
          )
        });
      } else {
        setSelectedText(null);
      }
    }
  };

  const handleTextFormat = (format: string) => {
    if (!textareaRef.current || !selectedText) return;
    
    const { start, end, text } = selectedText;
    let formattedText = text;
    
    switch (format) {
      case 'bold':
        formattedText = `**${text}**`;
        break;
      case 'italic':
        formattedText = `*${text}*`;
        break;
      case 'underline':
        formattedText = `__${text}__`;
        break;
      case 'h1':
        formattedText = `# ${text}`;
        break;
      case 'h2':
        formattedText = `## ${text}`;
        break;
      case 'bullet':
        formattedText = text.split('\n').map(line => `- ${line}`).join('\n');
        break;
      default:
        return;
    }
    
    const newContent = 
      content.substring(0, start) + 
      formattedText + 
      content.substring(end);
    
    onChange(newContent);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPosition = start + formattedText.length;
        textareaRef.current.setSelectionRange(newPosition, newPosition);
        handleTextareaSelect();
      }
    }, 0);
  };

  const handleTextAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (!textareaRef.current || !selectedText) return;
    
    const { start, end, text } = selectedText;
    const alignedText = `[ALIGN:${alignment}]${text}[/ALIGN]`;
    
    const newContent = 
      content.substring(0, start) + 
      alignedText + 
      content.substring(end);
    
    onChange(newContent);
  };

  const handleInsertPhone = () => {
    if (!textareaRef.current || cursorPosition === null) return;
    
    const phoneNumber = window.prompt("Inserisci il numero di telefono (formato: +39 123 456 7890):");
    if (!phoneNumber) return;
    
    const label = window.prompt("Inserisci l'etichetta per il numero di telefono:", phoneNumber);
    const displayLabel = label || phoneNumber;
    
    const formattedPhone = phoneNumber.replace(/\s+/g, '');
    const phonePlaceholder = `[PHONE:${formattedPhone}:${displayLabel}]`;
    
    const newContent = 
      content.substring(0, cursorPosition) + 
      phonePlaceholder + 
      content.substring(cursorPosition);
    
    onChange(newContent);
    
    toast.success("Numero di telefono aggiunto con successo");
  };

  const handleInsertMap = () => {
    if (!textareaRef.current || cursorPosition === null) return;
    
    const mapUrl = window.prompt("Inserisci l'URL di Google Maps:");
    if (!mapUrl) return;
    
    const label = window.prompt("Inserisci l'etichetta per la posizione:", "Visualizza su Google Maps");
    const displayLabel = label || "Visualizza su Google Maps";
    
    const mapPlaceholder = `[MAP:${mapUrl}:${displayLabel}]`;
    
    const newContent = 
      content.substring(0, cursorPosition) + 
      mapPlaceholder + 
      content.substring(cursorPosition);
    
    onChange(newContent);
    
    toast.success("Link a Google Maps aggiunto con successo");
  };

  const handleInsertImage = (imageUrl: string, position: "left" | "center" | "right" | "full" = "center", caption?: string) => {
    try {
      // Add the image to the images array
      const newImage: ImageDetail = {
        url: imageUrl,
        width: "50%",
        position,
        caption
      };
      
      onImageAdd(newImage);
      
      // Insert image placeholder at cursor position
      if (textareaRef.current && cursorPosition !== null) {
        const imagePlaceholder = `[IMAGE_${images.length}]`;
        const newContent = 
          content.substring(0, cursorPosition) + 
          imagePlaceholder + 
          content.substring(cursorPosition);
        
        onChange(newContent);
        
        // Set cursor position after the placeholder
        setTimeout(() => {
          if (textareaRef.current) {
            const newPosition = cursorPosition + imagePlaceholder.length;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newPosition, newPosition);
          }
        }, 0);
      }
      
      toast.success("Immagine aggiunta con successo");
      setShowImageDialog(false);
    } catch (error) {
      console.error("Errore durante l'inserimento dell'immagine:", error);
      toast.error("Errore durante l'inserimento dell'immagine");
    }
  };

  const handleImagePositionChange = (index: number, position: "left" | "center" | "right" | "full") => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], position };
    
    // Update all images at once
    updatedImages.forEach((image, idx) => {
      onImageAdd(image);
    });
    
    toast.success(`Posizione dell'immagine cambiata in: ${
      position === "left" ? "Sinistra" : 
      position === "right" ? "Destra" : 
      position === "full" ? "Intera larghezza" : 
      "Centro"
    }`);
  };

  const handleImageWidthChange = (index: number, width: number) => {
    const updatedImages = [...images];
    // Convert width to percentage string
    const widthPercentage = `${width}%`;
    updatedImages[index] = { ...updatedImages[index], width: widthPercentage };
    
    // Update all images at once
    updatedImages.forEach((image, idx) => {
      onImageAdd(image);
    });
  };

  const handleImageCaptionChange = (index: number, caption: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], caption };
    
    // Update all images at once
    updatedImages.forEach((image, idx) => {
      onImageAdd(image);
    });
  };

  const handleDeleteImage = (index: number) => {
    // Find the corresponding placeholder in the content and remove it
    const imagePlaceholder = `[IMAGE_${index}]`;
    const newContent = content.replace(imagePlaceholder, '');
    onChange(newContent);
    
    // Remove the image from the images array
    const updatedImages = images.filter((_, idx) => idx !== index);
    
    // Update all remaining images and their placeholders
    updatedImages.forEach((image, newIdx) => {
      onImageAdd(image);
      const oldPlaceholder = `[IMAGE_${newIdx + 1}]`;
      const newPlaceholder = `[IMAGE_${newIdx}]`;
      const updatedContent = newContent.replace(oldPlaceholder, newPlaceholder);
      onChange(updatedContent);
    });
    
    toast.success("Immagine eliminata con successo");
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    if (!isFullscreen && document.documentElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Errore nella richiesta di fullscreen: ${err.message}`);
      });
    } else if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch((err) => {
        console.error(`Errore nell'uscita da fullscreen: ${err.message}`);
      });
    }
  };

  // Handle image hover effects
  const handleImageMouseEnter = (index: number) => {
    setHoveredImageIndex(index);
  };

  const handleImageMouseLeave = () => {
    if (showImageControls === null) {
      setHoveredImageIndex(null);
    }
  };

  const toggleImageControls = (index: number) => {
    setShowImageControls(showImageControls === index ? null : index);
  };

  const handleOpenImageDialog = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
      setShowImageDialog(true);
    }
  };

  return (
    <div className={`flex flex-col space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md mb-4 sticky top-0 z-10">
        <div className="flex items-center gap-1 mr-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleUndo} disabled={historyIndex <= 0}>
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Annulla</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleRedo} disabled={historyIndex >= editHistory.length - 1}>
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ripeti</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="h-6 border-r border-gray-300"></div>
        
        {/* Text formatting options */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleTextFormat('bold')}
                disabled={!selectedText}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Grassetto</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleTextFormat('italic')}
                disabled={!selectedText}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Corsivo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleTextFormat('underline')}
                disabled={!selectedText}
              >
                <Underline className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sottolineato</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="h-6 border-r border-gray-300"></div>
        
        {/* Text alignment */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleTextAlign('left')}
                disabled={!selectedText}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Allinea a sinistra</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleTextAlign('center')}
                disabled={!selectedText}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Centra</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleTextAlign('right')}
                disabled={!selectedText}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Allinea a destra</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleTextAlign('justify')}
                disabled={!selectedText}
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Giustifica</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="h-6 border-r border-gray-300"></div>
        
        {/* Headings and lists */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={!selectedText}>
              <Type className="h-4 w-4 mr-1" />
              <span>Titoli</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleTextFormat('h1')}>
              <Heading1 className="h-4 w-4 mr-2" />
              Titolo grande
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTextFormat('h2')}>
              <Heading2 className="h-4 w-4 mr-2" />
              Sottotitolo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleTextFormat('bullet')}
                disabled={!selectedText}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Elenco puntato</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="h-6 border-r border-gray-300"></div>
        
        {/* Insert options */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenImageDialog}
                className="flex items-center gap-1"
              >
                <ImageIcon className="h-4 w-4" />
                Immagine
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Inserisci immagine</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleInsertPhone}
                className="flex items-center gap-1"
              >
                <Phone className="h-4 w-4" />
                Telefono
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Inserisci numero di telefono cliccabile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleInsertMap}
                className="flex items-center gap-1"
              >
                <MapPin className="h-4 w-4" />
                Mappa
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Inserisci collegamento a Google Maps</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="h-6 border-r border-gray-300 ml-auto"></div>
        
        {/* View options */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setEditMode(editMode === 'visual' ? 'preview' : 'visual')}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{editMode === 'visual' ? 'Anteprima' : 'Modifica'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Schermo intero</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {editMode === 'visual' ? (
          <div ref={editorRef} className="relative min-h-[500px] bg-white p-4">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onSelect={handleTextareaSelect}
              onClick={handleTextareaSelect}
              className="w-full h-full min-h-[400px] resize-none border-0 focus-visible:ring-0"
              placeholder="Inizia a scrivere qui..."
            />
          </div>
        ) : (
          <div 
            ref={previewRef}
            className="min-h-[500px] p-6 bg-white overflow-auto text-gray-800 prose max-w-none prose-headings:my-4 prose-p:my-2"
            dangerouslySetInnerHTML={{ __html: formattedPreview }}
          ></div>
        )}
      </div>

      {/* Image Gallery / Inserted Images */}
      {images.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium mb-3">Immagini inserite</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div 
                key={index}
                className="relative border rounded-md overflow-hidden bg-white group"
                onMouseEnter={() => handleImageMouseEnter(index)}
                onMouseLeave={handleImageMouseLeave}
              >
                <img 
                  src={image.url} 
                  alt={image.caption || `Immagine ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                
                <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center ${hoveredImageIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="z-10"
                    onClick={() => toggleImageControls(index)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Modifica
                  </Button>
                </div>
                
                <Badge className="absolute top-1 right-1 bg-gray-700 text-white">
                  {image.position === "left" ? "SX" : 
                   image.position === "right" ? "DX" : 
                   image.position === "full" ? "100%" : 
                   "Centro"}
                </Badge>
                
                {/* Image edit panel */}
                {showImageControls === index && (
                  <div className="absolute inset-0 bg-white z-20 p-3 flex flex-col">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-sm">Modifica immagine</span>
                      <Button variant="ghost" size="icon" onClick={() => setShowImageControls(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                      <div>
                        <Label htmlFor={`img-position-${index}`} className="text-xs">Posizione</Label>
                        <div className="flex gap-1 mt-1">
                          <Button 
                            variant={image.position === "left" ? "default" : "outline"} 
                            size="sm"
                            className="px-2 py-1 h-8"
                            onClick={() => handleImagePositionChange(index, "left")}
                          >
                            <PanelLeft className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={image.position === "center" ? "default" : "outline"} 
                            size="sm"
                            className="px-2 py-1 h-8"
                            onClick={() => handleImagePositionChange(index, "center")}
                          >
                            <AlignCenter className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={image.position === "right" ? "default" : "outline"} 
                            size="sm"
                            className="px-2 py-1 h-8"
                            onClick={() => handleImagePositionChange(index, "right")}
                          >
                            <PanelRight className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={image.position === "full" ? "default" : "outline"} 
                            size="sm"
                            className="px-2 py-1 h-8"
                            onClick={() => handleImagePositionChange(index, "full")}
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between">
                          <Label htmlFor={`img-width-${index}`} className="text-xs">Larghezza ({parseInt(image.width)}%)</Label>
                        </div>
                        <Slider
                          id={`img-width-${index}`}
                          min={10}
                          max={100}
                          step={5}
                          defaultValue={[parseInt(image.width)]}
                          onValueChange={(value) => handleImageWidthChange(index, value[0])}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`img-caption-${index}`} className="text-xs">Didascalia</Label>
                        <Input
                          id={`img-caption-${index}`}
                          value={image.caption || ''}
                          onChange={(e) => handleImageCaptionChange(index, e.target.value)}
                          placeholder="Aggiungi didascalia"
                          className="mt-1 h-8 text-sm"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteImage(index)}
                      className="mt-2"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Elimina immagine
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image insertion dialog */}
      <ImageInsertionDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onImageUpload={handleInsertImage}
      />
    </div>
  );
};
