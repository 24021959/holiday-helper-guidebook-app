
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentPanel } from "./ContentPanel";
import { SettingsPanel } from "./SettingsPanel";
import { MediaPanel } from "./MediaPanel";
import { PreviewPanel } from "./PreviewPanel";
import { FileText, Settings, Image, Eye } from "lucide-react";

interface CreatorTabsProps {
  pageTitle: string;
  pageContent: string;
  onPageTitleChange: (title: string) => void;
  onPageContentChange: (content: string) => void;
}

export const CreatorTabs: React.FC<CreatorTabsProps> = ({
  pageTitle,
  pageContent,
  onPageTitleChange,
  onPageContentChange
}) => {
  const [activeTab, setActiveTab] = useState("content");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full p-0 bg-gray-100 border-b border-gray-200">
        <TabsTrigger 
          value="content" 
          className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>Contenuto</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="media" 
          className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 transition-colors"
        >
          <Image className="w-4 h-4" />
          <span>Media</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="settings" 
          className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Impostazioni</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="preview" 
          className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>Anteprima</span>
        </TabsTrigger>
      </TabsList>

      <div className="p-6">
        <TabsContent value="content" className="mt-0">
          <ContentPanel 
            pageTitle={pageTitle}
            pageContent={pageContent}
            onPageTitleChange={onPageTitleChange}
            onPageContentChange={onPageContentChange}
          />
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
  );
};
