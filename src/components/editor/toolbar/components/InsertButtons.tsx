
import React from 'react';
import { Phone, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { InsertButtonsProps } from '../types';
import { ToolbarGroup } from './ToolbarGroup';
import TranslatedText from '@/components/TranslatedText';

export const InsertButtons: React.FC<InsertButtonsProps> = ({
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
};
