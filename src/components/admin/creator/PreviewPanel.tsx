
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, ExternalLink } from "lucide-react";
import { useEditorPreview } from "@/hooks/editor/useEditorPreview";
import { ImageDetail } from "@/types/image.types";

interface PreviewPanelProps {
  pageTitle: string;
  pageContent: string;
  pageImages?: ImageDetail[];
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  pageTitle,
  pageContent,
  pageImages = []
}) => {
  const { formattedPreview } = useEditorPreview(pageContent, pageImages || []);
  
  const handleExportHtml = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pageTitle}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 2rem; }
          img { max-width: 100%; height: auto; border-radius: 8px; }
          h1 { font-size: 2rem; margin-bottom: 1.5rem; color: #333; }
          h2 { font-size: 1.5rem; margin-bottom: 1rem; color: #444; }
          p { margin-bottom: 1rem; }
          .float-left { float: left; margin-right: 1rem; margin-bottom: 0.5rem; }
          .float-right { float: right; margin-left: 1rem; margin-bottom: 0.5rem; }
          figcaption { font-size: 0.875rem; color: #666; margin-top: 0.5rem; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${pageTitle}</h1>
        <div>${formattedPreview}</div>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageTitle.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-6">
      <Card className="border-amber-100 shadow-sm overflow-hidden">
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex justify-between items-center">
          <h3 className="text-amber-800 font-medium">Anteprima della Pagina</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 gap-1">
              <Eye className="h-4 w-4" />
              Anteprima Completa
            </Button>
            <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 gap-1" onClick={handleExportHtml}>
              <Download className="h-4 w-4" />
              Esporta HTML
            </Button>
            <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 gap-1">
              <ExternalLink className="h-4 w-4" />
              Condividi
            </Button>
          </div>
        </div>
        
        <CardContent className="p-0">
          <div className="border-4 border-amber-100 m-4 rounded-lg overflow-hidden">
            <div className="bg-white p-6 min-h-[500px]">
              {pageTitle ? (
                <>
                  <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: formattedPreview }}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                  <Eye className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-lg">Inserisci titolo e contenuto per visualizzare l'anteprima</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {pageTitle && pageContent && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-100">
          <h3 className="font-medium text-amber-800 mb-2">Dispositivi</h3>
          <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
            <Button variant="outline" size="sm" className="border-amber-200 text-amber-700">
              Desktop
            </Button>
            <Button variant="outline" size="sm" className="border-amber-200 text-amber-700">
              Tablet
            </Button>
            <Button variant="outline" size="sm" className="border-amber-200 text-amber-700">
              Mobile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
