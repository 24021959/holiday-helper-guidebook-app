
import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarGroup } from './ToolbarGroup';
import { AlignmentButtonsProps } from '../types';

export const AlignmentButtons: React.FC<AlignmentButtonsProps> = ({
  selectedText,
  onTextAlign,
}) => {
  return (
    <ToolbarGroup label="Alignment">
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
};
