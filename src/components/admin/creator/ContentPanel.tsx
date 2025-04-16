
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Heading1, Heading2 } from "lucide-react";

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
  const applyFormatting = (format: string) => {
    // Get text area element
    const textarea = document.getElementById('page-content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    // Get selection
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (start === end) return; // No text selected
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'align-left':
        formattedText = `[ALIGN:left]${selectedText}[/ALIGN]`;
        break;
      case 'align-center':
        formattedText = `[ALIGN:center]${selectedText}[/ALIGN]`;
        break;
      case 'align-right':
        formattedText = `[ALIGN:right]${selectedText}[/ALIGN]`;
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        break;
      default:
        return;
    }
    
    // Replace selected text with formatted text
    const newContent = 
      pageContent.substring(0, start) + 
      formattedText + 
      pageContent.substring(end);
    
    onPageContentChange(newContent);
    
    // Reset selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start,
        start + formattedText.length
      );
    }, 0);
  };
  
  return (
    <div className="space-y-6">
      <Card className="border-emerald-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-6">
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
              <div className="flex justify-between items-center">
                <Label htmlFor="page-content" className="text-lg font-medium text-emerald-800">
                  Contenuto della Pagina
                </Label>
                
                <div className="flex items-center gap-1 bg-emerald-50 p-1 rounded-md border border-emerald-100">
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-emerald-700"
                    onClick={() => applyFormatting('bold')}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-emerald-700"
                    onClick={() => applyFormatting('italic')}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-emerald-700"
                    onClick={() => applyFormatting('underline')}
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                  
                  <span className="w-px h-4 bg-emerald-200 mx-1"></span>
                  
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-emerald-700"
                    onClick={() => applyFormatting('align-left')}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-emerald-700"
                    onClick={() => applyFormatting('align-center')}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-emerald-700"
                    onClick={() => applyFormatting('align-right')}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  
                  <span className="w-px h-4 bg-emerald-200 mx-1"></span>
                  
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-emerald-700"
                    onClick={() => applyFormatting('h1')}
                  >
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-emerald-700"
                    onClick={() => applyFormatting('h2')}
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-emerald-700"
                    onClick={() => applyFormatting('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-emerald-200">
                <Textarea
                  id="page-content"
                  placeholder="Inizia a scrivere il contenuto della tua pagina..."
                  value={pageContent}
                  onChange={(e) => onPageContentChange(e.target.value)}
                  className="min-h-[300px] resize-y border-0 shadow-none focus-visible:ring-0 bg-transparent"
                />
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Seleziona il testo per formattarlo utilizzando i pulsanti sopra o l'editor avanzato in basso.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
