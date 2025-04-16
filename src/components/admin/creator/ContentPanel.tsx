
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface ContentPanelProps {
  pageTitle: string;
  pageContent: string;
  onPageTitleChange: (title: string) => void;
  onPageContentChange: (content: string) => void;
}

export const ContentPanel: React.FC<ContentPanelProps> = ({
  pageTitle,
  pageContent,
  onPageTitleChange,
  onPageContentChange
}) => {
  return (
    <div className="space-y-6">
      <Card className="border-emerald-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="page-title" className="text-lg font-medium text-emerald-800">
                Titolo della Pagina
              </Label>
              <Input
                id="page-title"
                placeholder="Inserisci il titolo della pagina..."
                value={pageTitle}
                onChange={(e) => onPageTitleChange(e.target.value)}
                className="mt-2 border-emerald-200 focus-visible:ring-emerald-500"
              />
            </div>
            
            <div>
              <Label htmlFor="page-content" className="text-lg font-medium text-emerald-800">
                Contenuto della Pagina
              </Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-emerald-200">
                <Textarea
                  id="page-content"
                  placeholder="Inizia a scrivere il contenuto della tua pagina..."
                  value={pageContent}
                  onChange={(e) => onPageContentChange(e.target.value)}
                  className="min-h-[300px] resize-y border-0 shadow-none focus-visible:ring-0 bg-transparent"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
