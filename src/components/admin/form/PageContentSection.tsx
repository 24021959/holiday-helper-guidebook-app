
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PageContentSectionProps {
  content: string;
  setContent: (content: string) => void;
}

export const PageContentSection: React.FC<PageContentSectionProps> = ({
  content,
  setContent
}) => {
  return (
    <div className="space-y-2">
      <Label>Contenuto</Label>
      <Textarea 
        id="content" 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        placeholder="Inserisci il contenuto della pagina..."
        className="min-h-[300px]"
      />
    </div>
  );
};
