
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface PreviewPanelProps {
  pageTitle: string;
  pageContent: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  pageTitle,
  pageContent
}) => {
  return (
    <div className="space-y-6">
      <Card className="border-amber-100 shadow-sm overflow-hidden">
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex justify-between items-center">
          <h3 className="text-amber-800 font-medium">Anteprima della Pagina</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-amber-600 border-amber-200">
              <Eye className="h-4 w-4 mr-1" />
              Anteprima Completa
            </Button>
            <Button variant="outline" size="sm" className="text-amber-600 border-amber-200">
              <Download className="h-4 w-4 mr-1" />
              Esporta HTML
            </Button>
          </div>
        </div>
        
        <CardContent className="p-0">
          <div className="border-4 border-amber-100 m-4 rounded-lg overflow-hidden">
            <div className="bg-white p-6 min-h-[400px]">
              {pageTitle ? (
                <>
                  <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>
                  <div className="prose">
                    {pageContent.split('\n').map((paragraph, index) => (
                      paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                    ))}
                  </div>
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
    </div>
  );
};
