import React, { useState, useRef, useCallback } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import ImageInsertionDialog from "./ImageInsertionDialog";
import { Button } from "@/components/ui/button";
import { 
  ImageIcon, Info, Rows3, PanelRight, PanelLeft, AlignCenter, MapPin, Phone,
  Bold, Italic, List, ListOrdered, Heading1, Heading2, Link as LinkIcon, Quote,
  Eye, EyeOff, Maximize2, Minimize2, Trash2, Edit2, Code, RotateCcw, RotateCw
} from "lucide-react";
import { ImageItem } from "./PageMultiImageSection";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEditHistory } from "@/hooks/useEditHistory";
import PageFullscreenPreview from "./PageFullscreenPreview";

interface PageContentSectionProps {
  name: string;
  label: string;
  pageImages?: ImageItem[];
  onInsertImage?: (imageId: number) => void;
}

export const PageContentSection: React.FC<PageContentSectionProps> = ({
  name,
  label,
  pageImages = [],
  onInsertImage
}) => {
  const { control, setValue, getValues, watch } = useFormContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [clickPosition, setClickPosition] = useState<number | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  
  const contentValue = watch(name);
  const editHistory = useEditHistory<string>(contentValue || "");
  
  React.useEffect(() => {
    setPreviewContent(formatContentForPreview(contentValue || ""));
  }, [contentValue]);

  const handleContentChange = (value: string) => {
    if (value !== contentValue) {
      editHistory.update(value);
      setValue(name, value, { shouldDirty: true });
    }
  };

  const handleUndo = () => {
    if (editHistory.canUndo) {
      editHistory.undo();
      setValue(name, editHistory.state, { shouldDirty: true });
    }
  };

  const handleRedo = () => {
    if (editHistory.canRedo) {
      editHistory.redo();
      setValue(name, editHistory.state, { shouldDirty: true });
    }
  };

  const formatContentForPreview = (content: string): string => {
    if (!content) return "";
    
    let formattedContent = content;
    
    const imageRegex = /<!-- IMAGE: (.*?) POSITION: (.*?) -->\n\[Immagine: (.*?)\]\n/g;
    formattedContent = formattedContent.replace(imageRegex, (match, url, position, name) => {
      const positionClass = position === "left" ? "editor-preview-image-left" : 
                          position === "right" ? "editor-preview-image-right" : 
                          position === "full" ? "editor-preview-image-full" : 
                          "editor-preview-image-center";
                          
      return `<div class="image-placeholder ${positionClass}">
        <img src="${url}" alt="${name}" class="image-preview" />
      </div>`;
    });
    
    formattedContent = formattedContent.replace(
      /<!-- IMAGE: (.*?) -->\n\[Immagine: (.*?)\]\n/g,
      (match, url, name) => {
        return `<div class="image-placeholder image-placeholder-center">
          <img src="${url}" alt="${name}" class="image-preview" />
        </div>`;
      }
    );
    
    formattedContent = formattedContent.replace(
      /<!-- FORMAT:LEFT -->\n(.*?)(?=<!-- FORMAT:|$)/gs, 
      '<div style="text-align: left;">$1</div>'
    );
    
    formattedContent = formattedContent.replace(
      /<!-- FORMAT:CENTER -->\n(.*?)(?=<!-- FORMAT:|$)/gs, 
      '<div style="text-align: center;">$1</div>'
    );
    
    formattedContent = formattedContent.replace(
      /<!-- FORMAT:RIGHT -->\n(.*?)(?=<!-- FORMAT:|$)/gs, 
      '<div style="text-align: right;">$1</div>'
    );
    
    formattedContent = formattedContent.replace(
      /\*\*(.*?)\*\*/g,
      '<strong>$1</strong>'
    );
    
    formattedContent = formattedContent.replace(
      /\*(.*?)\*/g,
      '<em>$1</em>'
    );
    
    formattedContent = formattedContent.replace(
      /<!-- LIST:BULLET -->\n((?:- .*?\n?)+)/gs,
      (match, list) => {
        const items = list.split('\n')
          .filter(item => item.trim().startsWith('- '))
          .map(item => `<li>${item.substring(2).trim()}</li>`)
          .join('');
        return `<ul style="list-style-type: disc; padding-left: 2rem;">${items}</ul>`;
      }
    );
    
    formattedContent = formattedContent.replace(
      /<!-- LIST:NUMBERED -->\n((?:\d+\. .*?\n?)+)/gs,
      (match, list) => {
        const items = list.split('\n')
          .filter(item => /^\d+\.\s/.test(item.trim()))
          .map(item => `<li>${item.replace(/^\d+\.\s/, '').trim()}</li>`)
          .join('');
        return `<ol style="list-style-type: decimal; padding-left: 2rem;">${items}</ol>`;
      }
    );
    
    formattedContent = formattedContent.replace(
      /<!-- HEADING:1 -->\n(.*?)(?=\n|$)/g,
      '<h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">$1</h1>'
    );
    
    formattedContent = formattedContent.replace(
      /<!-- HEADING:2 -->\n(.*?)(?=\n|$)/g,
      '<h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">$1</h2>'
    );
    
    formattedContent = formattedContent.replace(
      /<!-- QUOTE -->\n(.*?)(?=<!-- QUOTE|$)/gs,
      '<blockquote style="border-left: 3px solid #e5e7eb; padding-left: 1rem; font-style: italic; margin: 1rem 0;">$1</blockquote>'
    );
    
    formattedContent = formattedContent.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" style="color: #3b82f6; text-decoration: underline;">$1</a>'
    );
    
    formattedContent = formattedContent.replace(
      /<!-- MAP: (.*?) -->\n\[📍 (.*?)\]\n/g,
      '<div class="bg-blue-50 border border-blue-200 rounded p-2 my-2 flex items-center gap-2"><span class="text-blue-700">📍</span><a href="$1" target="_blank" class="text-blue-600 hover:underline">$2</a></div>'
    );
    
    formattedContent = formattedContent.replace(
      /<!-- PHONE: (.*?) -->\n\[📞 (.*?)\]\n/g,
      '<div class="bg-green-50 border border-green-200 rounded p-2 my-2 flex items-center"><span class="text-green-700">📞 $2</span></div>'
    );
    
    formattedContent = formattedContent.replace(/\n\n/g, '<br><br>');
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return formattedContent;
  };

  const formatTextareaContent = (content: string): string => {
    if (!content) return "";
    
    if (viewMode === "visual") {
      let formattedContent = content.replace(
        /(<!-- IMAGE: (.*?) POSITION: (.*?) -->\n\[Immagine: (.*?)\]\n)/g,
        (match, fullMatch, url, position, name) => {
          const posText = position === 'left' ? '◀️' : 
                          position === 'right' ? '▶️' : 
                          position === 'full' ? '⬛' : '⏺️';
          
          if (url.startsWith('data:image')) {
            return `[📷 ${posText} ${name}]\n`;
          }
          
          return `[📷 ${posText} ${name}]\n`;
        }
      );
      
      formattedContent = formattedContent.replace(
        /(<!-- IMAGE: (.*?) -->\n\[Immagine: (.*?)\]\n)/g,
        (match, fullMatch, url, name) => {
          return `[📷 ⏺️ ${name}]\n`;
        }
      );
      
      formattedContent = formattedContent.replace(
        /<!-- MAP: (.*?) -->\n\[📍 (.*?)\]\n/g,
        (match, url, placeName) => {
          return `[📍 Luogo: ${placeName}]\n`;
        }
      );
      
      formattedContent = formattedContent.replace(
        /<!-- PHONE: (.*?) -->\n\[📞 (.*?)\]\n/g,
        (match, number, label) => {
          return `[📞 ${label}]\n`;
        }
      );
      
      return formattedContent;
    }
    
    return content;
  };

  const handleTextFormat = useCallback((command: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const content = getValues(name) as string;
    
    let formattedText = '';
    
    switch (command) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
        
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
        
      case 'bulletList':
        if (selectedText.includes('\n')) {
          formattedText = `<!-- LIST:BULLET -->\n${selectedText.split('\n').filter(line => line.trim()).map(line => `- ${line.trim()}`).join('\n')}\n`;
        } else {
          formattedText = `<!-- LIST:BULLET -->\n- ${selectedText}\n`;
        }
        break;
        
      case 'numberedList':
        if (selectedText.includes('\n')) {
          formattedText = `<!-- LIST:NUMBERED -->\n${selectedText.split('\n').filter(line => line.trim()).map((line, i) => `${i + 1}. ${line.trim()}`).join('\n')}\n`;
        } else {
          formattedText = `<!-- LIST:NUMBERED -->\n1. ${selectedText}\n`;
        }
        break;
        
      case 'heading1':
        formattedText = `<!-- HEADING:1 -->\n${selectedText}\n`;
        break;
        
      case 'heading2':
        formattedText = `<!-- HEADING:2 -->\n${selectedText}\n`;
        break;
        
      case 'link':
        const url = window.prompt('Inserisci URL:', 'https://');
        if (url) {
          formattedText = `[${selectedText || 'Link'}](${url})`;
        } else {
          return;
        }
        break;
        
      case 'quote':
        formattedText = `<!-- QUOTE -->\n${selectedText}\n`;
        break;
        
      default:
        return;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setValue(name, newContent, { shouldDirty: true });
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + formattedText.length;
      textarea.selectionStart = newPosition;
      textarea.selectionEnd = newPosition;
    }, 0);
  }, [getValues, setValue, name]);

  const handleInsertImageClick = () => {
    if (textareaRef.current) {
      setClickPosition(textareaRef.current.selectionStart);
      setShowImageDialog(true);
    }
  };

  const handleInsertGalleryImageClick = () => {
    if (textareaRef.current) {
      setClickPosition(textareaRef.current.selectionStart);
      setShowGalleryDialog(true);
    }
  };

  const handleInsertMapClick = () => {
    if (textareaRef.current) {
      setClickPosition(textareaRef.current.selectionStart);
      setShowMapDialog(true);
    }
  };

  const handleInsertPhoneClick = () => {
    if (textareaRef.current) {
      setClickPosition(textareaRef.current.selectionStart);
      setShowPhoneDialog(true);
    }
  };

  const handleFormatClick = (format: 'paragraph' | 'left' | 'right' | 'center') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const content = getValues(name) as string;
    
    let formattedText = '';
    
    switch (format) {
      case 'paragraph':
        formattedText = selectedText
          .split('.')
          .map(sentence => sentence.trim())
          .filter(sentence => sentence.length > 0)
          .join('.\n\n');
        
        if (!formattedText.endsWith('.')) formattedText += '.';
        break;
      
      case 'left':
      case 'right':
      case 'center':
        formattedText = `<!-- FORMAT:${format.toUpperCase()} -->\n${selectedText}\n`;
        break;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setValue(name, newContent, { shouldDirty: true });
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
    }, 0);
  };

  const handleInsertImage = (imageUrl: string, position: "left" | "center" | "right" | "full" = "center") => {
    try {
      const content = getValues(name) as string;
      if (clickPosition !== null) {
        editHistory.update(content);
        
        let imageName = "Immagine";
        if (imageUrl.startsWith('data:image')) {
          imageName = "Immagine caricata";
        } else {
          const urlParts = imageUrl.split('/');
          if (urlParts.length > 0) {
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart && lastPart.length > 0) {
              imageName = lastPart.length > 20 ? lastPart.substring(0, 20) + "..." : lastPart;
            }
          }
        }
        
        const imageMarkup = `\n<!-- IMAGE: ${imageUrl} POSITION: ${position} -->\n[Immagine: ${imageName}]\n`;
        const newContent = content.substring(0, clickPosition) + imageMarkup + content.substring(clickPosition);
        setValue(name, newContent, { shouldDirty: true });
        
        console.log("Immagine inserita correttamente:", imageName, "posizione:", position);
      }
    } catch (error) {
      console.error("Errore durante l'inserimento dell'immagine:", error);
    }
    setShowImageDialog(false);
  };

  const handleInsertGalleryImage = (imageId: number) => {
    try {
      if (onInsertImage) {
        onInsertImage(imageId);
      }
    } catch (error) {
      console.error("Errore durante l'inserimento dell'immagine dalla galleria:", error);
    }
    setShowGalleryDialog(false);
  };

  const handleInsertMap = (mapUrl: string, placeName: string) => {
    try {
      const content = getValues(name) as string;
      if (clickPosition !== null) {
        const mapMarkup = `\n<!-- MAP: ${mapUrl} -->\n[📍 ${placeName}]\n`;
        const newContent = content.substring(0, clickPosition) + mapMarkup + content.substring(clickPosition);
        setValue(name, newContent, { shouldDirty: true });
        
        console.log("Link a Google Maps inserito correttamente:", placeName);
      }
    } catch (error) {
      console.error("Errore durante l'inserimento del link a Google Maps:", error);
    }
    setShowMapDialog(false);
  };

  const handleInsertPhone = (phoneNumber: string, label: string) => {
    try {
      const content = getValues(name) as string;
      if (clickPosition !== null) {
        const formattedNumber = phoneNumber.replace(/\s+/g, '');
        const phoneMarkup = `\n<!-- PHONE: ${formattedNumber} -->\n[📞 ${label || phoneNumber}]\n`;
        const newContent = content.substring(0, clickPosition) + phoneMarkup + content.substring(clickPosition);
        setValue(name, newContent, { shouldDirty: true });
        
        console.log("Numero di telefono inserito correttamente:", phoneNumber);
      }
    } catch (error) {
      console.error("Errore durante l'inserimento del numero di telefono:", error);
    }
    setShowPhoneDialog(false);
  };

  const togglePreview = () => {
    setShowFullscreenPreview(true);
  };

  const toggleEditorExpansion = () => {
    setIsEditorExpanded(!isEditorExpanded);
  };

  const handleViewModeChange = (mode: "visual" | "code") => {
    setViewMode(mode);
  };

  const handleDeleteImage = (imageUrl: string, position: number) => {
    try {
      const content = getValues(name) as string;
      editHistory.update(content);
      
      const imageMarkupRegex = new RegExp(`<!-- IMAGE: ${imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} POSITION: .*? -->\n\\[Immagine: .*?\\]\n`, 'g');
      const newContent = content.replace(imageMarkupRegex, '');
      setValue(name, newContent, { shouldDirty: true });
    } catch (error) {
      console.error("Errore durante l'eliminazione dell'immagine:", error);
    }
  };

  const handleEditImage = (imageUrl: string, position: number) => {
    setClickPosition(position);
    setShowImageDialog(true);
  };

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>{label}</FormLabel>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleUndo}
                        className="h-8 w-8"
                        disabled={!editHistory.canUndo}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Annulla ultima modifica</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleRedo}
                        className="h-8 w-8"
                        disabled={!editHistory.canRedo}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ripristina modifica</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={togglePreview} 
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Anteprima a schermo intero</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewModeChange(viewMode === "visual" ? "code" : "visual")}
                        className="h-8 w-8"
                      >
                        {viewMode === "visual" ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{viewMode === "visual" ? "Visualizza codice" : "Visualizza anteprima"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleEditorExpansion}
                        className="h-8 w-8"
                      >
                        {isEditorExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isEditorExpanded ? "Riduci editor" : "Espandi editor"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm p-4 text-sm">
                      <p>Suggerimenti per la leggibilità:</p>
                      <ul className="list-disc ml-4 mt-2 space-y-1">
                        <li>Utilizza paragrafi brevi (2-3 frasi)</li>
                        <li>Inserisci uno spazio vuoto tra i paragrafi</li>
                        <li>Usa elenchi puntati per informazioni importanti</li>
                        <li>Evidenzia le parole chiave in grassetto</li>
                        <li>Aggiungi link a Google Maps per le località</li>
                        <li>Inserisci numeri di telefono cliccabili</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2 w-full border-b pb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTextFormat('bold')}
                        className="text-xs"
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
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTextFormat('italic')}
                        className="text-xs"
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
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTextFormat('bulletList')}
                        className="text-xs"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Elenco puntato</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTextFormat('numberedList')}
                        className="text-xs"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Elenco numerato</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTextFormat('heading1')}
                        className="text-xs"
                      >
                        <Heading1 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Titolo principale</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTextFormat('heading2')}
                        className="text-xs"
                      >
                        <Heading2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sottotitolo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTextFormat('link')}
                        className="text-xs"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Inserisci link</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTextFormat('quote')}
                        className="text-xs"
                      >
                        <Quote className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Citazione</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFormatClick('paragraph')}
                        className="text-xs"
                      >
                        <Rows3 className="h-4 w-4 mr-1" />
                        Separa in paragrafi
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Divide il testo selezionato in paragrafi dopo ogni punto</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFormatClick('left')}
                        className="text-xs"
                      >
                        <PanelLeft className="h-4 w-4 mr-1" />
                        Allinea a sinistra
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Allinea il testo selezionato a sinistra</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFormatClick('center')}
                        className="text-xs"
                      >
                        <AlignCenter className="h-4 w-4 mr-1" />
                        Centra
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Centra il testo selezionato</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFormatClick('right')}
                        className="text-xs"
                      >
                        <PanelRight className="h-4 w-4 mr-1" />
                        Allinea a destra
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Allinea il testo selezionato a destra</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className={`${showFullscreenPreview ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}`}>
                <div className={`${isEditorExpanded ? "h-[65vh]" : ""} ${viewMode === "visual" ? "editor-visual-mode" : "editor-code-mode"}`}>
                  <FormControl>
                    <Textarea
                      {...field}
                      ref={textareaRef}
                      className={`min-h-[350px] font-medium leading-relaxed p-4 resize-none ${isEditorExpanded ? "h-full" : ""}`}
                      style={{ lineHeight: "1.8" }}
                      value={formatTextareaContent(field.value || "")}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        if (e.target.value.length > 0 && e.target.value !== field.value) {
                          handleContentChange(e.target.value);
                        }
                      }}
                      expandable={true}
                      viewMode={viewMode}
                      onViewModeChange={handleViewModeChange}
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                    />
                  </FormControl>
                </div>
                
                {showFullscreenPreview && (
                  <div>
                    <div className="border rounded-md p-4 min-h-[350px] bg-white overflow-auto">
                      <div 
                        className="prose prose-sm max-w-none" 
                        dangerouslySetInnerHTML={{ __html: previewContent }} 
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">Anteprima della formattazione</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 sticky bottom-0 bg-white z-10 py-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleInsertImageClick}
                  className="flex items-center"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Inserisci nuova immagine
                </Button>
                
                {pageImages.length > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleInsertGalleryImageClick}
                    className="flex items-center"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Inserisci da galleria
                  </Button>
                )}

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleInsertMapClick}
                  className="flex items-center"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Inserisci link Google Maps
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleInsertPhoneClick}
                  className="flex items-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Inserisci numero di telefono
                </Button>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <ImageInsertionDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onImageUpload={handleInsertImage}
      />

      {showGalleryDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Scegli immagine dalla galleria</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {pageImages.map((image, idx) => (
                <div 
                  key={idx} 
                  className="relative border rounded cursor-pointer hover:border-emerald-500 transition-colors"
                  onClick={() => handleInsertGalleryImage(idx)}
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img 
                      src={image.url} 
                      alt={`Immagine ${idx + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs px-2 py-1 rounded-bl">
                    {image.position === "left" ? "SX" : 
                     image.position === "right" ? "DX" : 
                     image.position === "center" ? "Centro" : "Intera"}
                  </div>
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {image.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowGalleryDialog(false)}
              >
                Annulla
              </Button>
            </div>
          </div>
        </div>
      )}

      {showMapDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Inserisci link a Google Maps</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome del luogo
                </label>
                <input 
                  type="text" 
                  id="placeName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Es. Ristorante Da Mario"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL di Google Maps
                </label>
                <input 
                  type="text" 
                  id="mapUrl"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://maps.google.com/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cerca il luogo su Google Maps, clicca su "Condividi" e copia il link
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowMapDialog(false)}
              >
                Annulla
              </Button>
              <Button 
                onClick={() => {
                  const mapUrlInput = document.getElementById('mapUrl') as HTMLInputElement;
                  const placeNameInput = document.getElementById('placeName') as HTMLInputElement;
                  if (mapUrlInput && placeNameInput) {
                    handleInsertMap(mapUrlInput.value, placeNameInput.value);
                  }
                }}
              >
                Inserisci
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPhoneDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Inserisci numero di telefono</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etichetta (opzionale)
                </label>
                <input 
                  type="text" 
                  id="phoneLabel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Es. Prenotazioni"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero di telefono
                </label>
                <input 
                  type="tel" 
                  id="phoneNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+39 123 456 7890"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowPhoneDialog(false)}
              >
                Annulla
              </Button>
              <Button 
                onClick={() => {
                  const phoneNumberInput = document.getElementById('phoneNumber') as HTMLInputElement;
                  const phoneLabelInput = document.getElementById('phoneLabel') as HTMLInputElement;
                  if (phoneNumberInput) {
                    handleInsertPhone(phoneNumberInput.value, phoneLabelInput?.value || '');
                  }
                }}
              >
                Inserisci
              </Button>
            </div>
          </div>
        </div>
      )}

      <PageFullscreenPreview
        isOpen={showFullscreenPreview}
        onClose={() => setShowFullscreenPreview(false)}
        content={
          <div 
            className="prose prose-sm max-w-none" 
            dangerouslySetInnerHTML={{ __html: previewContent }} 
          />
        }
        title="Anteprima Contenuto"
        openInNewWindow={true}
      />
    </>
  );
};
