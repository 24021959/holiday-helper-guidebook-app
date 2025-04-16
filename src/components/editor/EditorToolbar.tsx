
import React from 'react';
import { Button } from "@/components/ui/button";
import { ImageIcon, Maximize2, Minimize2, Eye, EyeOff } from "lucide-react";

interface EditorToolbarProps {
  expanded: boolean;
  previewMode: boolean;
  onToggleExpand: () => void;
  onTogglePreview: () => void;
  onInsertImage: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  expanded,
  previewMode,
  onToggleExpand,
  onTogglePreview,
  onInsertImage
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center space-x-2">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          onClick={onInsertImage}
          className="text-gray-500 hover:text-gray-700"
        >
          <ImageIcon className="h-4 w-4 mr-1" />
          <span className="text-xs">Inserisci Immagine</span>
        </Button>
      </div>
      <div className="flex items-center space-x-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onTogglePreview}
          className="h-8 w-8"
          title={previewMode ? "Modalità modifica" : "Modalità anteprima"}
        >
          {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
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
