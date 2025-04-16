
import React from 'react';
import { Bold, Italic, Underline, Heading1, Heading2, List } from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarGroup } from './ToolbarGroup';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Type } from 'lucide-react';
import { FormatButtonsProps } from '../types';

export const FormatButtons: React.FC<FormatButtonsProps> = ({
  selectedText,
  onTextFormat,
}) => {
  return (
    <ToolbarGroup label="Format">
      <ToolbarButton
        icon={Bold}
        label="Grassetto"
        onClick={() => onTextFormat('bold')}
        disabled={!selectedText}
      />
      <ToolbarButton
        icon={Italic}
        label="Corsivo"
        onClick={() => onTextFormat('italic')}
        disabled={!selectedText}
      />
      <ToolbarButton
        icon={Underline}
        label="Sottolineato"
        onClick={() => onTextFormat('underline')}
        disabled={!selectedText}
      />
      
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

      <ToolbarButton
        icon={List}
        label="Elenco puntato"
        onClick={() => onTextFormat('bullet')}
        disabled={!selectedText}
      />
    </ToolbarGroup>
  );
};
