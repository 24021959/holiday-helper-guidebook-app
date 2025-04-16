
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Bold, Italic, Underline, Type, List, Heading1, Heading2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ImageIcon, Phone, MapPin, Eye, Maximize2, 
  Undo, Redo, ChevronDown
} from 'lucide-react';

interface EditorToolbarProps {
  historyIndex: number;
  editHistory: string[];
  selectedText: { start: number; end: number; text: string; } | null;
  editMode: 'visual' | 'preview';
  onUndo: () => void;
  onRedo: () => void;
  onTextFormat: (format: string) => void;
  onTextAlign: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
  onOpenImageDialog: () => void;
  onInsertPhone: () => void;
  onInsertMap: () => void;
  onToggleEditMode: () => void;
  onToggleFullscreen: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  historyIndex,
  editHistory,
  selectedText,
  editMode,
  onUndo,
  onRedo,
  onTextFormat,
  onTextAlign,
  onOpenImageDialog,
  onInsertPhone,
  onInsertMap,
  onToggleEditMode,
  onToggleFullscreen,
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md mb-4 sticky top-0 z-10">
      <div className="flex items-center gap-1 mr-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onUndo} disabled={historyIndex <= 0}>
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
              <Button variant="outline" size="icon" onClick={onRedo} disabled={historyIndex >= editHistory.length - 1}>
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
              onClick={() => onTextFormat('bold')}
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
              onClick={() => onTextFormat('italic')}
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
              onClick={() => onTextFormat('underline')}
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
              onClick={() => onTextAlign('left')}
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
              onClick={() => onTextAlign('center')}
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
              onClick={() => onTextAlign('right')}
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
              onClick={() => onTextAlign('justify')}
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
          <DropdownMenuItem onClick={() => onTextFormat('h1')}>
            <Heading1 className="h-4 w-4 mr-2" />
            Titolo grande
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTextFormat('h2')}>
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
              onClick={() => onTextFormat('bullet')}
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
              onClick={onOpenImageDialog}
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
              onClick={onInsertPhone}
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
              onClick={onInsertMap}
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
              onClick={onToggleEditMode}
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
            <Button variant="outline" size="icon" onClick={onToggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Schermo intero</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
