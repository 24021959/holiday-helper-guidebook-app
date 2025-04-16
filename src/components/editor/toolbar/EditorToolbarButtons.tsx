import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ImageIcon, Phone, MapPin, Type, List, ChevronDown, Eye, EyeOff, Maximize2,
  Heading1, Heading2, Undo, Redo
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ToolbarGroup } from './components/ToolbarGroup';
import { ToolbarButton } from './components/ToolbarButton';
import TranslatedText from '@/components/TranslatedText';
import { 
  FormatButtonsProps, 
  AlignmentButtonsProps,
  InsertButtonsProps,
  ViewButtonsProps,
  HistoryButtonsProps 
} from './types';

export const FormatButtons: React.FC<FormatButtonsProps> = ({ selectedText, onTextFormat }) => (
  <ToolbarGroup>
    <ToolbarButton 
      icon={Bold}
      label="Grassetto"
      onClick={() => selectedText && onTextFormat('bold', selectedText)}
      disabled={!selectedText}
    />
    <ToolbarButton 
      icon={Italic}
      label="Corsivo"
      onClick={() => selectedText && onTextFormat('italic', selectedText)}
      disabled={!selectedText}
    />
    <ToolbarButton 
      icon={Underline}
      label="Sottolineato"
      onClick={() => selectedText && onTextFormat('underline', selectedText)}
      disabled={!selectedText}
    />
  </ToolbarGroup>
);

export const AlignmentButtons: React.FC<AlignmentButtonsProps> = ({ selectedText, onTextAlign }) => (
  <ToolbarGroup>
    <ToolbarButton 
      icon={AlignLeft}
      label="Allinea a sinistra"
      onClick={() => selectedText && onTextAlign('left', selectedText)}
      disabled={!selectedText}
    />
    <ToolbarButton 
      icon={AlignCenter}
      label="Centra"
      onClick={() => selectedText && onTextAlign('center', selectedText)}
      disabled={!selectedText}
    />
    <ToolbarButton 
      icon={AlignRight}
      label="Allinea a destra"
      onClick={() => selectedText && onTextAlign('right', selectedText)}
      disabled={!selectedText}
    />
    <ToolbarButton 
      icon={AlignJustify}
      label="Giustifica"
      onClick={() => selectedText && onTextAlign('justify', selectedText)}
      disabled={!selectedText}
    />
  </ToolbarGroup>
);

export const HeadingsDropdown: React.FC<FormatButtonsProps> = ({ selectedText, onTextFormat }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" disabled={!selectedText}>
        <Type className="h-4 w-4 mr-1" />
        <span><TranslatedText text="Titoli" disableAutoTranslation={true} /></span>
        <ChevronDown className="h-3 w-3 ml-1" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => selectedText && onTextFormat('h1', selectedText)}>
        <Heading1 className="h-4 w-4 mr-2" />
        <TranslatedText text="Titolo grande" disableAutoTranslation={true} />
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => selectedText && onTextFormat('h2', selectedText)}>
        <Heading2 className="h-4 w-4 mr-2" />
        <TranslatedText text="Sottotitolo" disableAutoTranslation={true} />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const InsertButtons: React.FC<InsertButtonsProps> = ({ onOpenImageDialog, onInsertPhone, onInsertMap }) => (
  <ToolbarGroup>
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
            <TranslatedText text="Immagine" disableAutoTranslation={true} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p><TranslatedText text="Inserisci immagine" disableAutoTranslation={true} /></p>
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
            <TranslatedText text="Telefono" disableAutoTranslation={true} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p><TranslatedText text="Inserisci numero di telefono cliccabile" disableAutoTranslation={true} /></p>
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
            <TranslatedText text="Mappa" disableAutoTranslation={true} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p><TranslatedText text="Inserisci collegamento a Google Maps" disableAutoTranslation={true} /></p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </ToolbarGroup>
);

export const ViewButtons: React.FC<ViewButtonsProps> = ({ 
  editMode, 
  onToggleEditMode, 
  onToggleFullscreen 
}) => (
  <ToolbarGroup>
    <ToolbarButton 
      icon={editMode === 'visual' ? Eye : EyeOff}
      label={editMode === 'visual' ? "Anteprima" : "Modifica"}
      onClick={onToggleEditMode}
    />
    <ToolbarButton 
      icon={Maximize2}
      label="Schermo intero"
      onClick={onToggleFullscreen}
    />
  </ToolbarGroup>
);

export const HistoryButtons: React.FC<HistoryButtonsProps> = ({ 
  historyIndex, 
  editHistory, 
  onUndo, 
  onRedo 
}) => (
  <ToolbarGroup label="History">
    <ToolbarButton 
      icon={Undo}
      label="Annulla"
      onClick={onUndo}
      disabled={historyIndex <= 0}
    />
    <ToolbarButton 
      icon={Redo}
      label="Ripeti"
      onClick={onRedo}
      disabled={historyIndex >= editHistory.length - 1}
    />
  </ToolbarGroup>
);
