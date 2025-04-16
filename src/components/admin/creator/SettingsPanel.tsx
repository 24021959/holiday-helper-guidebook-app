
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FileCode, Save, Globe } from "lucide-react";

export const SettingsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-purple-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium text-purple-800">
                Impostazioni SEO
              </Label>
              
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="page-url" className="text-sm font-medium">
                    URL della Pagina
                  </Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-purple-200 bg-purple-50 text-purple-500 text-sm">
                      example.com/
                    </span>
                    <Input
                      id="page-url"
                      placeholder="nome-pagina"
                      className="rounded-l-none border-purple-200 focus-visible:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meta-description" className="text-sm font-medium">
                    Meta Descrizione
                  </Label>
                  <Input
                    id="meta-description"
                    placeholder="Inserisci una descrizione per i motori di ricerca..."
                    className="border-purple-200 focus-visible:ring-purple-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-purple-100">
              <Label className="text-lg font-medium text-purple-800">
                Opzioni Avanzate
              </Label>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="publish-switch" className="text-sm font-medium">
                      Pubblica Pagina
                    </Label>
                    <p className="text-xs text-gray-500">
                      La pagina sarà visibile nel sito
                    </p>
                  </div>
                  <Switch id="publish-switch" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="index-switch" className="text-sm font-medium">
                      Indicizza nei Motori di Ricerca
                    </Label>
                    <p className="text-xs text-gray-500">
                      La pagina sarà indicizzata da Google
                    </p>
                  </div>
                  <Switch id="index-switch" defaultChecked />
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end space-x-3">
              <Button variant="outline" className="border-purple-200 text-purple-700">
                <FileCode className="h-4 w-4 mr-2" />
                Anteprima HTML
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                Salva Impostazioni
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
