
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  ImageIcon, Phone, MapPin, Type, List, Undo, Redo, 
  Maximize2, Minimize2, Eye, EyeOff 
} from "lucide-react";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import TranslatedText from '@/components/TranslatedText';

interface EditorToolbarProps {
  expanded: boolean;
  previewMode: boolean;
  selectedText: { start: number; end: number; text: string } | null;
  historyIndex: number;
  editHistory: string[];
  onToggleExpand: () => void;
  onTogglePreview: () => void;
  onInsertImage: () => void;
  onTextFormat: (format: string) => void;
  onTextAlign: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
  onInsertPhone: () => void;
  onInsertMap: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  expanded,
  previewMode,
  selectedText,
  historyIndex,
  editHistory,
  onToggleExpand,
  onTogglePreview,
  onInsertImage,
  onTextFormat,
  onTextAlign,
  onInsertPhone,
  onInsertMap,
  onUndo,
  onRedo
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white border-b">
      {/* Text Formatting Group */}
      <div className="flex flex-wrap items-center gap-1">
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => onTextFormat('bold')}
          disabled={!selectedText}
          title="Grassetto"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => onTextFormat('italic')}
          disabled={!selectedText}
          title="Corsivo"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => onTextFormat('underline')}
          disabled={!selectedText}
          title="Sottolineato"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="h-6 border-r border-gray-200 mx-1" />

        {/* Text Alignment Group */}
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => onTextAlign('left')}
          disabled={!selectedText}
          title="Allinea a sinistra"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => onTextAlign('center')}
          disabled={!selectedText}
          title="Centra"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => onTextAlign('right')}
          disabled={!selectedText}
          title="Allinea a destra"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => onTextAlign('justify')}
          disabled={!selectedText}
          title="Giustifica"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        
        <div className="h-6 border-r border-gray-200 mx-1" />
      </div>

      {/* Heading and Lists Group */}
      <div className="flex flex-wrap items-center gap-1">
        <Menubar className="border-none p-0">
          <MenubarMenu>
            <MenubarTrigger className="h-8 px-2 py-1 data-[state=open]:bg-accent">
              <div className="flex items-center gap-1 text-sm">
                <Type className="h-4 w-4" />
                <span><TranslatedText text="Titoli" disableAutoTranslation={true} /></span>
              </div>
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => selectedText && onTextFormat('h1')} disabled={!selectedText}>
                <span className="text-lg font-bold">H1</span> <span className="ml-2 text-sm text-muted-foreground">Titolo</span>
              </MenubarItem>
              <MenubarItem onClick={() => selectedText && onTextFormat('h2')} disabled={!selectedText}>
                <span className="text-md font-bold">H2</span> <span className="ml-2 text-sm text-muted-foreground">Sottotitolo</span>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <Menubar className="border-none p-0">
          <MenubarMenu>
            <MenubarTrigger className="h-8 px-2 py-1 data-[state=open]:bg-accent">
              <div className="flex items-center gap-1 text-sm">
                <List className="h-4 w-4" />
                <span><TranslatedText text="Liste" disableAutoTranslation={true} /></span>
              </div>
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => selectedText && onTextFormat('bullet')} disabled={!selectedText}>
                <span className="flex items-center gap-2">
                  <span>•</span> <span className="text-sm">Lista puntata</span>
                </span>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <div className="h-6 border-r border-gray-200 mx-1" />
      </div>

      {/* Insert Group */}
      <div className="flex flex-wrap items-center gap-1">
        <Button 
          variant="ghost"
          size="sm"
          onClick={onInsertImage}
          className="flex items-center gap-1 h-8"
          title="Inserisci immagine"
        >
          <ImageIcon className="h-4 w-4" />
          <span className="text-xs sm:text-sm hidden sm:inline">
            <TranslatedText text="Immagine" disableAutoTranslation={true} />
          </span>
        </Button>
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={onInsertPhone}
          className="flex items-center gap-1 h-8"
          title="Inserisci telefono"
        >
          <Phone className="h-4 w-4" />
          <span className="text-xs sm:text-sm hidden sm:inline">
            <TranslatedText text="Telefono" disableAutoTranslation={true} />
          </span>
        </Button>
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={onInsertMap}
          className="flex items-center gap-1 h-8"
          title="Inserisci mappa"
        >
          <MapPin className="h-4 w-4" />
          <span className="text-xs sm:text-sm hidden sm:inline">
            <TranslatedText text="Mappa" disableAutoTranslation={true} />
          </span>
        </Button>

        <div className="h-6 border-r border-gray-200 mx-1" />
      </div>

      {/* History Group */}
      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={historyIndex === 0}
          title="Annulla"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={historyIndex === editHistory.length - 1}
          title="Ripeti"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="h-6 border-r border-gray-200 mx-1" />
      </div>

      {/* View controls (right-aligned) */}
      <div className="flex items-center ml-auto gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePreview}
          className="h-8 w-8"
          title={previewMode ? "Modalità modifica" : "Modalità anteprima"}
        >
          {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleExpand}
          className="h-8 w-8"
          title={expanded ? "Riduci editor" : "Espandi editor"}
        >
          {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
