
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreatePageForm from "./CreatePageForm"; 
import ManagePagesView from "./ManagePagesView";
import { HeaderSettingsView } from "./HeaderSettingsView";
import MenuTranslationManager from "./MenuTranslationManager";
import ChatbotSettings from "./ChatbotSettings";
import ChatbotAnalytics from "./chatbot/ChatbotAnalytics";
import FooterSettingsView from "./FooterSettingsView";
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
  handlePageCreated: (newPages: PageData[]) => void;
  handlePagesUpdate: (updatedPages: PageData[]) => void;
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
  keywordToIconMap,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-8 w-full justify-start border-b rounded-none bg-transparent h-auto pb-0 p-0 space-x-1">
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
          Gestione Pagine
        </TabsTrigger>
        <TabsTrigger
          value="header-settings"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Impostazioni Header
        </TabsTrigger>
        <TabsTrigger
          value="menu-translations"
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
        <TabsTrigger
          value="chatbot-analytics"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Analisi Chatbot
        </TabsTrigger>
        <TabsTrigger
          value="footer-settings"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Footer
        </TabsTrigger>
      </TabsList>

      <div className="admin-tab-content bg-white shadow-md rounded-md p-6 border">
        <TabsContent value="create-page" className="mt-0">
          <CreatePageForm
            parentPages={parentPages}
            onPageCreated={handlePageCreated}
            keywordToIconMap={keywordToIconMap}
          />
        </TabsContent>

        <TabsContent value="manage-pages" className="mt-0">
          <ManagePagesView
            pages={pages}
            onPagesUpdate={handlePagesUpdate}
            parentPages={parentPages}
            keywordToIconMap={keywordToIconMap}
          />
        </TabsContent>

        <TabsContent value="header-settings" className="mt-0">
          <HeaderSettingsView
            uploadedLogo={uploadedLogo}
            setUploadedLogo={setUploadedLogo}
            headerColor={headerColor}
            setHeaderColor={setHeaderColor}
          />
        </TabsContent>

        <TabsContent value="menu-translations" className="mt-0">
          <MenuTranslationManager />
        </TabsContent>
        
        <TabsContent value="chatbot-settings" className="mt-0">
          <ChatbotSettings />
        </TabsContent>
        
        <TabsContent value="chatbot-analytics" className="mt-0">
          <ChatbotAnalytics />
        </TabsContent>
        
        <TabsContent value="footer-settings" className="mt-0">
          <FooterSettingsView />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default AdminPanel;
