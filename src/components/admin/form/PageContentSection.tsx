
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
      <Label htmlFor="content">Contenuto</Label>
      <Textarea 
        id="content" 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        placeholder="Contenuto della pagina"
        className="min-h-[200px]"
      />
    </div>
  );
};
