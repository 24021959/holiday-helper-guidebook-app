
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
        onClick={() => onTextAlign('left')}
        disabled={!selectedText}
      />
      <ToolbarButton
        icon={AlignCenter}
        label="Centra"
        onClick={() => onTextAlign('center')}
        disabled={!selectedText}
      />
      <ToolbarButton
        icon={AlignRight}
        label="Allinea a destra"
        onClick={() => onTextAlign('right')}
        disabled={!selectedText}
      />
      <ToolbarButton
        icon={AlignJustify}
        label="Giustifica"
        onClick={() => onTextAlign('justify')}
        disabled={!selectedText}
      />
    </ToolbarGroup>
  );
};
