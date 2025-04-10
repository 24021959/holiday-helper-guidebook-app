
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManagePagesView from "./ManagePagesView";
import { HeaderSettingsView } from "./HeaderSettingsView";
import MenuTranslationManager from "./MenuTranslationManager";
import { CreatePageForm } from "./CreatePageForm";
import ChatbotSettings from "./ChatbotSettings";

interface AdminPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pages: any[];
  parentPages: any[];
  uploadedLogo: string | null;
  setUploadedLogo: (logo: string | null) => void;
  headerColor: string;
  setHeaderColor: (color: string) => void;
  handlePageCreated: (pages: any[]) => void;
  handlePagesUpdate: (pages: any[]) => void;
  keywordToIconMap: Record<string, string>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  activeTab, 
  setActiveTab,
  pages,
  parentPages,
  uploadedLogo,
  setUploadedLogo,
  headerColor,
  setHeaderColor,
  handlePageCreated,
  handlePagesUpdate,
  keywordToIconMap
}) => {
  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="inline-flex w-full justify-start overflow-x-auto space-x-1 mb-8 border-b rounded-none bg-transparent h-auto pb-0 p-0">
        <TabsTrigger 
          value="manage-pages"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Gestione Pagine
        </TabsTrigger>
        <TabsTrigger 
          value="create-page"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Crea Pagina
        </TabsTrigger>
        <TabsTrigger 
          value="header-settings"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Impostazioni Header
        </TabsTrigger>
        <TabsTrigger 
          value="translations"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Traduzioni Menu
        </TabsTrigger>
        <TabsTrigger 
          value="chatbot-settings"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Chatbot
        </TabsTrigger>
      </TabsList>
      
      <div className="admin-tab-content bg-white shadow-md rounded-md p-6 border">
        <TabsContent value="manage-pages" className="space-y-4 mt-0">
          <ManagePagesView 
            pages={pages} 
            onPagesUpdate={handlePagesUpdate}
            parentPages={parentPages}
            keywordToIconMap={keywordToIconMap}
          />
        </TabsContent>

        <TabsContent value="create-page" className="space-y-4 mt-0">
          <CreatePageForm
            parentPages={parentPages}
            onPageCreated={handlePageCreated}
            keywordToIconMap={keywordToIconMap}
          />
        </TabsContent>

        <TabsContent value="header-settings" className="space-y-4 mt-0">
          <HeaderSettingsView 
            uploadedLogo={uploadedLogo}
            setUploadedLogo={setUploadedLogo}
            headerColor={headerColor}
            setHeaderColor={setHeaderColor}
          />
        </TabsContent>

        <TabsContent value="translations" className="space-y-4 mt-0">
          <MenuTranslationManager />
        </TabsContent>
        
        <TabsContent value="chatbot-settings" className="space-y-4 mt-0">
          <ChatbotSettings />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default AdminPanel;
