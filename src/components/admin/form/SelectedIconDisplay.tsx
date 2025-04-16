
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import IconRenderer from "@/components/IconRenderer";

interface SelectedIconDisplayProps {
  iconName: string;
}

export const SelectedIconDisplay: React.FC<SelectedIconDisplayProps> = ({ 
  iconName 
}) => {
  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="mb-2">
          <strong>Icona selezionata:</strong>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border">
          <IconRenderer iconName={iconName} size="medium" />
          <span className="text-sm">{iconName}</span>
        </div>
      </CardContent>
    </Card>
  );
};

