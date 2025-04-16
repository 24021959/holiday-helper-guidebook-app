
import React from 'react';
import { ImageIcon, Phone, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { InsertButtonsProps } from '../types';
import { ToolbarGroup } from './ToolbarGroup';

export const InsertButtons: React.FC<InsertButtonsProps> = ({
  onOpenImageDialog,
  onInsertPhone,
  onInsertMap,
}) => {
  return (
    <ToolbarGroup label="Insert">
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
    </ToolbarGroup>
  );
};
