
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/admin/manage/LanguageSelector";
import { FileText, FileFolder, LayoutGrid } from "lucide-react";

export const SettingsPanel: React.FC = () => {
  const [pageType, setPageType] = useState("normal");
  const [currentLanguage, setCurrentLanguage] = useState("it");
  const [autoTranslate, setAutoTranslate] = useState(true);
  
  return (
    <div className="space-y-6">
      <Card className="border-purple-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium text-purple-800 mb-4 block">
                Lingua
              </Label>
              <LanguageSelector 
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
              />
              
              <div className="flex items-center space-x-2 mt-4">
                <Switch 
                  id="auto-translate"
                  checked={autoTranslate}
                  onCheckedChange={setAutoTranslate}
                />
                <Label htmlFor="auto-translate" className="text-sm text-gray-600">
                  Traduci automaticamente la pagina in tutte le lingue
                </Label>
              </div>
            </div>
            
            <div className="pt-4 border-t border-purple-100">
              <Label className="text-lg font-medium text-purple-800 mb-4 block">
                Tipo di Pagina
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className={`flex flex-col items-center justify-center h-24 ${
                    pageType === "normal" 
                      ? "bg-purple-100 border-purple-300 text-purple-800" 
                      : ""
                  }`}
                  onClick={() => setPageType("normal")}
                >
                  <FileText className="h-8 w-8 mb-2" />
                  <span>Pagina Normale</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className={`flex flex-col items-center justify-center h-24 ${
                    pageType === "parent" 
                      ? "bg-purple-100 border-purple-300 text-purple-800" 
                      : ""
                  }`}
                  onClick={() => setPageType("parent")}
                >
                  <FileFolder className="h-8 w-8 mb-2" />
                  <span>Pagina Master</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className={`flex flex-col items-center justify-center h-24 ${
                    pageType === "submenu" 
                      ? "bg-purple-100 border-purple-300 text-purple-800" 
                      : ""
                  }`}
                  onClick={() => setPageType("submenu")}
                >
                  <LayoutGrid className="h-8 w-8 mb-2" />
                  <span>Sottopagina</span>
                </Button>
              </div>
            </div>
            
            {pageType === "submenu" && (
              <div className="pt-4 border-t border-purple-100">
                <Label htmlFor="parent-page" className="text-lg font-medium text-purple-800 mb-2 block">
                  Pagina Genitore
                </Label>
                <Select defaultValue="home">
                  <SelectTrigger id="parent-page">
                    <SelectValue placeholder="Seleziona pagina genitore" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="about">Chi Siamo</SelectItem>
                    <SelectItem value="services">Servizi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="pt-4 border-t border-purple-100">
              <Label htmlFor="page-icon" className="text-lg font-medium text-purple-800 mb-2 block">
                Icona della Pagina
              </Label>
              <Select defaultValue="FileText">
                <SelectTrigger id="page-icon">
                  <SelectValue placeholder="Seleziona icona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FileText">Documento</SelectItem>
                  <SelectItem value="Home">Casa</SelectItem>
                  <SelectItem value="Info">Informazioni</SelectItem>
                  <SelectItem value="Coffee">Caffè</SelectItem>
                  <SelectItem value="Map">Mappa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
