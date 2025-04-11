
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredIcons, setFilteredIcons] = useState<string[]>([]);
  
  // Default icons if no icon map is available
  const defaultIcons = ["FileText", "Home", "Settings", "User", "Info", "List", "Menu"];
  
  useEffect(() => {
    // Use the keywordToIconMap if available, otherwise use default icons
    const allIcons = Object.keys(keywordToIconMap).length > 0 
      ? Object.values(keywordToIconMap)
      : defaultIcons;
      
    if (!searchTerm) {
      setFilteredIcons(allIcons);
      return;
    }
    
    const filtered = allIcons.filter(icon => 
      icon.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIcons(filtered);
  }, [searchTerm, keywordToIconMap]);
  
  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-between w-full">
            {selectedIcon || "Seleziona un'icona"}
            <Search className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="p-4">
            <Input
              placeholder="Cerca icona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            <div className="grid grid-cols-4 gap-2 mt-2 max-h-48 overflow-y-auto">
              {filteredIcons.map((icon) => (
                <div
                  key={icon}
                  className={`p-2 border rounded-md cursor-pointer flex items-center justify-center hover:bg-gray-100 ${
                    selectedIcon === icon ? "bg-emerald-100 border-emerald-500" : ""
                  }`}
                  onClick={() => {
                    onIconSelect(icon);
                  }}
                >
                  <span className="text-xs">{icon}</span>
                </div>
              ))}
              {filteredIcons.length === 0 && (
                <div className="col-span-4 p-4 text-center text-gray-500">
                  Nessuna icona trovata
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
