
import React from "react";
import { Input } from "@/components/ui/input";

interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect: (icon: string) => void;
  keywordToIconMap: Record<string, string>;
}

export const IconPicker: React.FC<IconPickerProps> = ({ 
  selectedIcon, 
  onIconSelect,
  keywordToIconMap 
}) => {
  return (
    <div>
      <Input
        placeholder="Seleziona un'icona"
        value={selectedIcon || ""}
        onChange={(e) => onIconSelect(e.target.value)}
      />
    </div>
  );
};
