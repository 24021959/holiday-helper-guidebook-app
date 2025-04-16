
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { VisualEditor } from "@/components/admin/VisualEditor";
import { ImageDetail } from "@/types/image.types";
import { useToast } from "@/hooks/use-toast";
import { usePageCreation } from "@/hooks/usePageCreation";
import { PageType } from "@/types/form.types";

const PageCreator = () => {
  const [pageTitle, setPageTitle] = useState<string>("");
  const [pageContent, setPageContent] = useState<string>("");
  const [pageImages, setPageImages] = useState<ImageDetail[]>([]);
  const [pageType, setPageType] = useState<PageType>("normal");
  
  const { toast } = useToast();
  const { handlePageCreation, isCreating } = usePageCreation({
    onPageCreated: () => {
      toast({
        title: "Successo",
        description: "La pagina è stata creata con successo",
      });
    }
  });

  const handleSavePage = () => {
    if (!pageTitle.trim()) {
      toast({
        title: "Errore",
        description: "Il titolo è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    handlePageCreation(
      {
        title: pageTitle,
        content: pageContent,
        icon: "FileText",
        pageType: pageType,
        parentPath: "",
      },
      null,
      pageImages,
      () => {
        setPageTitle("");
        setPageContent("");
        setPageImages([]);
      }
    );
  };

  const handleImageAdd = (image: ImageDetail) => {
    setPageImages((prev) => [...prev, image]);
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <Card className="border-emerald-100">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="page-title" className="text-lg font-medium text-emerald-800">
                Titolo della Pagina
              </Label>
              <Input
                id="page-title"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Inserisci il titolo della pagina..."
                className="mt-2 border-emerald-200"
              />
            </div>

            <div>
              <Label className="text-lg font-medium text-emerald-800 mb-2 block">
                Tipo di Pagina
              </Label>
              <Tabs value={pageType} onValueChange={(value: PageType) => setPageType(value)} className="w-full">
                <TabsList className="w-full bg-white/50 backdrop-blur-sm border border-emerald-200">
                  <TabsTrigger 
                    value="normal" 
                    className="flex-1 data-[state=active]:bg-emerald-100"
                  >
                    Normale
                  </TabsTrigger>
                  <TabsTrigger 
                    value="submenu" 
                    className="flex-1 data-[state=active]:bg-emerald-100"
                  >
                    Sottopagina
                  </TabsTrigger>
                  <TabsTrigger 
                    value="parent" 
                    className="flex-1 data-[state=active]:bg-emerald-100"
                  >
                    Master
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <Label className="text-lg font-medium text-emerald-800">
                Contenuto della Pagina
              </Label>
              <div className="mt-2">
                <VisualEditor
                  content={pageContent}
                  images={pageImages}
                  onChange={setPageContent}
                  onImageAdd={handleImageAdd}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSavePage}
                disabled={isCreating || !pageTitle}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isCreating ? "Salvataggio..." : "Salva Pagina"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageCreator;
