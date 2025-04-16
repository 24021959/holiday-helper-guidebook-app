
import React from 'react';
import { Undo, Redo } from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarGroup } from './ToolbarGroup';
import { HistoryButtonsProps } from '../types';

export const HistoryButtons: React.FC<HistoryButtonsProps> = ({
  historyIndex,
  editHistory,
  onUndo,
  onRedo,
}) => {
  return (
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
};
