
import React from 'react';
import { Button } from "@/components/ui/button";
import { ImageIcon, Maximize2, Minimize2, Eye, EyeOff } from "lucide-react";
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
      <div className="flex flex-wrap items-center gap-2">
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => onTextFormat('bold')}
          disabled={!selectedText}
        >
          <span className="font-bold">B</span>
        </Button>
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => onTextFormat('italic')}
          disabled={!selectedText}
        >
          <span className="italic">I</span>
        </Button>

        <div className="h-6 border-r border-gray-200" />

        <Button 
          variant="ghost"
          size="sm"
          onClick={() => onTextAlign('left')}
          disabled={!selectedText}
        >
          ⟵
        </Button>
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => onTextAlign('center')}
          disabled={!selectedText}
        >
          ⟷
        </Button>
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => onTextAlign('right')}
          disabled={!selectedText}
        >
          ⟶
        </Button>

        <div className="h-6 border-r border-gray-200" />

        <Button 
          variant="ghost"
          size="sm"
          onClick={onInsertImage}
        >
          <ImageIcon className="h-4 w-4 mr-1" />
          <TranslatedText text="Inserisci Immagine" disableAutoTranslation={true} />
        </Button>

        <div className="h-6 border-r border-gray-200" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={historyIndex === 0}
        >
          ↩
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={historyIndex === editHistory.length - 1}
        >
          ↪
        </Button>

        <div className="h-6 border-r border-gray-200" />
      </div>

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
