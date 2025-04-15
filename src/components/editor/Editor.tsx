
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  return (
    <div className="border rounded-md p-2 min-h-[300px]">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[300px] w-full resize-none focus-visible:ring-0 border-none p-0"
        placeholder="Scrivi il contenuto della pagina qui..."
      />
    </div>
  );
};
