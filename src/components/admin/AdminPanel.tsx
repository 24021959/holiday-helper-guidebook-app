
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManagePagesView } from "@/components/admin/ManagePagesView";
import { HeaderSettingsView } from "@/components/admin/HeaderSettingsView";
import { ChatbotSettingsView } from "@/components/admin/ChatbotSettingsView";
import { CreatePageForm } from "@/components/admin/CreatePageForm";
import { PageData } from "@/pages/Admin";

interface AdminPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pages: PageData[];
  parentPages: PageData[];
  uploadedLogo: string | null;
  setUploadedLogo: (logo: string | null) => void;
  headerColor: string;
  setHeaderColor: (color: string) => void;
  chatbotCode: string;
  setChatbotCode: (code: string) => void;
  handlePageCreated: (newPages: PageData[]) => void;
  handlePagesUpdate: (updatedPages: PageData[]) => void;
  handleSaveChatbotSettings: () => Promise<void>;
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
  chatbotCode,
  setChatbotCode,
  handlePageCreated,
  handlePagesUpdate,
  handleSaveChatbotSettings,
  keywordToIconMap
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-8 w-full justify-start border-b rounded-none bg-transparent h-auto pb-0">
        <TabsTrigger 
          value="create-page"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Crea Pagina
        </TabsTrigger>
        <TabsTrigger 
          value="manage-pages"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Gestisci Pagine
        </TabsTrigger>
        <TabsTrigger 
          value="header-settings"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Impostazioni Header
        </TabsTrigger>
        <TabsTrigger 
          value="chatbot-settings"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Impostazioni Chatbot
        </TabsTrigger>
      </TabsList>
      
      <div className="bg-white shadow-md rounded-md p-6 border">
        <TabsContent value="create-page">
          <CreatePageForm 
            parentPages={parentPages} 
            onPageCreated={handlePageCreated}
            keywordToIconMap={keywordToIconMap}
          />
        </TabsContent>
        
        <TabsContent value="manage-pages">
          <ManagePagesView 
            pages={pages} 
            onPagesUpdate={handlePagesUpdate}
          />
        </TabsContent>
        
        <TabsContent value="header-settings">
          <HeaderSettingsView 
            uploadedLogo={uploadedLogo}
            setUploadedLogo={setUploadedLogo}
            headerColor={headerColor}
            setHeaderColor={setHeaderColor}
          />
        </TabsContent>
        
        <TabsContent value="chatbot-settings">
          <ChatbotSettingsView 
            chatbotCode={chatbotCode}
            setChatbotCode={setChatbotCode}
            onSave={handleSaveChatbotSettings}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default AdminPanel;
