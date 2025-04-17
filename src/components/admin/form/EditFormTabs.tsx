
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContentSection } from './PageContentSection';
import { PageMultiImageSection } from './PageMultiImageSection';
import { PageImageSection } from './PageImageSection';
import { ImageItem } from "@/types/image.types";

interface EditFormTabsProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pageImages: ImageItem[];
  handlePageImagesChange: (images: ImageItem[]) => void;
  handleImageInsertion: (imageId: number) => void;
  uploadedImage: string | null;
  setUploadedImage: (url: string | null) => void;
}

export const EditFormTabs: React.FC<EditFormTabsProps> = ({
  currentTab,
  setCurrentTab,
  pageImages,
  handlePageImagesChange,
  handleImageInsertion,
  uploadedImage,
  setUploadedImage
}) => {
  return (
    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="content">Contenuto</TabsTrigger>
        <TabsTrigger value="images">Galleria Immagini</TabsTrigger>
        <TabsTrigger value="thumbnail">Immagine Principale</TabsTrigger>
      </TabsList>
      
      <TabsContent value="content">
        <PageContentSection 
          name="content" 
          label="Contenuto della pagina" 
          pageImages={pageImages}
          onInsertImage={handleImageInsertion}
        />
      </TabsContent>
      
      <TabsContent value="images">
        <PageMultiImageSection 
          images={pageImages}
          onImagesChange={handlePageImagesChange}
        />
      </TabsContent>
      
      <TabsContent value="thumbnail">
        <PageImageSection 
          imageUrl={uploadedImage}
          onImageUploaded={setUploadedImage}
        />
      </TabsContent>
    </Tabs>
  );
};
