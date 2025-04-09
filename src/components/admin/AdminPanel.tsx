
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManagePagesView from "./ManagePagesView";
import { HeaderSettingsView } from "./HeaderSettingsView";
import { ChatbotSettingsView } from "./ChatbotSettingsView";
import MenuTranslationManager from "./MenuTranslationManager";
import { CreatePageForm } from "./CreatePageForm";

interface AdminPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pages: any[];
  parentPages: any[];
  uploadedLogo: string | null;
  setUploadedLogo: (logo: string | null) => void;
  headerColor: string;
  setHeaderColor: (color: string) => void;
  chatbotCode: string;
  setChatbotCode: (code: string) => void;
  handlePageCreated: (pages: any[]) => void;
  handlePagesUpdate: (pages: any[]) => void;
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
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="flex flex-wrap mb-8">
        <TabsTrigger value="manage-pages">Gestione Pagine</TabsTrigger>
        <TabsTrigger value="create-page">Crea Pagina</TabsTrigger>
        <TabsTrigger value="header-settings">Impostazioni Header</TabsTrigger>
        <TabsTrigger value="translations">Traduzioni Menu</TabsTrigger>
        <TabsTrigger value="chatbot-settings">Impostazioni Chatbot</TabsTrigger>
      </TabsList>
      
      <TabsContent value="manage-pages" className="space-y-4">
        <ManagePagesView 
          pages={pages} 
          onPagesUpdate={handlePagesUpdate}
          parentPages={parentPages}
          keywordToIconMap={keywordToIconMap}
        />
      </TabsContent>

      <TabsContent value="create-page" className="space-y-4">
        <CreatePageForm
          parentPages={parentPages}
          onPageCreated={handlePageCreated}
          keywordToIconMap={keywordToIconMap}
        />
      </TabsContent>

      <TabsContent value="header-settings" className="space-y-4">
        <HeaderSettingsView 
          uploadedLogo={uploadedLogo}
          setUploadedLogo={setUploadedLogo}
          headerColor={headerColor}
          setHeaderColor={setHeaderColor}
        />
      </TabsContent>

      <TabsContent value="translations" className="space-y-4">
        <MenuTranslationManager />
      </TabsContent>
      
      <TabsContent value="chatbot-settings" className="space-y-4">
        <ChatbotSettingsView 
          chatbotCode={chatbotCode}
          setChatbotCode={setChatbotCode}
          onSave={handleSaveChatbotSettings}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AdminPanel;
