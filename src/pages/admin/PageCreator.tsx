
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentPanel } from "@/components/admin/creator/ContentPanel";
import { SettingsPanel } from "@/components/admin/creator/SettingsPanel";
import { MediaPanel } from "@/components/admin/creator/MediaPanel";
import { PreviewPanel } from "@/components/admin/creator/PreviewPanel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageFormSchema } from "@/components/admin/schemas/pageFormSchema";
import { PageType } from "@/types/form.types";
import { usePageCreation } from "@/hooks/usePageCreation";
import { ImageDetail } from "@/types/image.types";
import { toast } from "sonner";
import { Save, FileUp, Eye } from "lucide-react";
import { VisualEditor } from "@/components/admin/VisualEditor";

const PageCreator = () => {
  const [pageTitle, setPageTitle] = useState<string>("");
  const [pageContent, setPageContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState("content");
  const [pageType, setPageType] = useState<PageType>("normal");
  const [parentPath, setParentPath] = useState<string>("");
  const [icon, setIcon] = useState<string>("FileText");
  const [pageImages, setPageImages] = useState<ImageDetail[]>([]);
  
  const form = useForm({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: "",
      content: "",
      icon: "FileText",
      pageType: "normal" as PageType,
      parentPath: "",
    },
  });
  
  const { handlePageCreation, isCreating } = usePageCreation({
    onPageCreated: () => {
      toast.success("Pagina creata con successo!");
    }
  });
  
  const handleSavePage = () => {
    handlePageCreation(
      {
        title: pageTitle,
        content: pageContent,
        icon: icon,
        pageType: pageType,
        parentPath: parentPath,
      },
      null, // no featured image for now
      pageImages,
      () => {
        // Reset form after success
        setPageTitle("");
        setPageContent("");
        setPageType("normal");
        setParentPath("");
        setIcon("FileText");
        setPageImages([]);
        form.reset();
      }
    );
  };
  
  const handleImageAdd = (image: ImageDetail) => {
    setPageImages((prev) => [...prev, image]);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Crea Nuova Pagina
          </h1>
          
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Anteprima
            </Button>
            <Button 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white gap-2"
              onClick={handleSavePage}
              disabled={isCreating || !pageTitle}
            >
              <Save className="h-4 w-4" />
              {isCreating ? "Salvataggio..." : "Salva Pagina"}
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full p-0 bg-gray-100 border-b border-gray-200">
              <TabsTrigger 
                value="content" 
                className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 transition-colors"
              >
                <span>Contenuto</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="media" 
                className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 transition-colors"
              >
                <span>Media</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="settings" 
                className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 transition-colors"
              >
                <span>Impostazioni</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="preview" 
                className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 transition-colors"
              >
                <span>Anteprima</span>
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="content" className="mt-0 space-y-6">
                <ContentPanel 
                  pageTitle={pageTitle}
                  pageContent={pageContent}
                  onPageTitleChange={setPageTitle}
                  onPageContentChange={setPageContent}
                />
                
                <Card className="border-emerald-100 shadow-sm mt-6">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium text-emerald-800 mb-4">Editor Avanzato</h3>
                    <VisualEditor
                      content={pageContent}
                      images={pageImages}
                      onChange={setPageContent}
                      onImageAdd={handleImageAdd}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="media" className="mt-0">
                <MediaPanel />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0">
                <SettingsPanel />
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0">
                <PreviewPanel 
                  pageTitle={pageTitle}
                  pageContent={pageContent}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        <Card className="border-gray-100">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-100">
                <h3 className="font-medium text-pink-800">Tipo di Pagina</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {pageType === "normal" && "Pagina Normale - Pagina standard del sito"}
                  {pageType === "submenu" && "Sottopagina - Pagina che appare in un sottomenu"}
                  {pageType === "parent" && "Pagina Master - Pagina che può contenere sottopagine"}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800">Contenuto</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {pageTitle ? `Titolo: ${pageTitle}` : "Nessun titolo impostato"}
                  <br />
                  {pageContent ? `${pageContent.length} caratteri di contenuto` : "Nessun contenuto"}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border border-green-100">
                <h3 className="font-medium text-green-800">Media</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {pageImages.length > 0 
                    ? `${pageImages.length} immagini aggiunte` 
                    : "Nessuna immagine aggiunta"}
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-between">
            <p className="text-sm text-gray-500">
              Stai creando una pagina di tipo: <span className="font-medium">{pageType}</span>
            </p>
            <Button 
              onClick={handleSavePage} 
              disabled={isCreating || !pageTitle}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white gap-2"
            >
              <FileUp className="h-4 w-4" />
              {isCreating ? "Pubblicazione..." : "Pubblica"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PageCreator;
