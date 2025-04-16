
import React from 'react';
import { Eye, Maximize2 } from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarGroup } from './ToolbarGroup';
import { ViewButtonsProps } from '../types';

export const ViewButtons: React.FC<ViewButtonsProps> = ({
  editMode,
  onToggleEditMode,
  onToggleFullscreen,
}) => {
  return (
    <ToolbarGroup>
      <ToolbarButton
        icon={Eye}
        label={editMode === 'visual' ? 'Anteprima' : 'Modifica'}
        onClick={onToggleEditMode}
      />
      <ToolbarButton
        icon={Maximize2}
        label="Schermo intero"
        onClick={onToggleFullscreen}
      />
    </ToolbarGroup>
  );
};
