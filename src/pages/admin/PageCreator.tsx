
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentPanel } from "@/components/admin/creator/ContentPanel";
import { SettingsPanel } from "@/components/admin/creator/SettingsPanel";
import { MediaPanel } from "@/components/admin/creator/MediaPanel";
import { PreviewPanel } from "@/components/admin/creator/PreviewPanel";
import { CreatorTabs } from "@/components/admin/creator/CreatorTabs";

const PageCreator = () => {
  const [pageTitle, setPageTitle] = useState<string>("");
  const [pageContent, setPageContent] = useState<string>("");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Crea Nuova Pagina
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <CreatorTabs 
            onPageTitleChange={setPageTitle}
            onPageContentChange={setPageContent}
            pageTitle={pageTitle}
            pageContent={pageContent}
          />
        </div>
      </div>
    </div>
  );
};

export default PageCreator;
