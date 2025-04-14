
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagementView } from "./UserManagementView";
import ChatbotSettings from "./chatbot/ChatbotSettings";
import ChatbotAnalytics from "./chatbot/ChatbotAnalytics";
import FooterSettingsView from "./FooterSettingsView";
import { HeaderSettingsView } from "./HeaderSettingsView";

const MasterPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("user-management");
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [headerColor, setHeaderColor] = useState<string>("bg-gradient-to-r from-teal-500 to-emerald-600");
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-8 w-full justify-start border-b rounded-none bg-transparent h-auto pb-0 p-0 space-x-1">
        <TabsTrigger 
          value="user-management"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Gestione Utenti
        </TabsTrigger>
        <TabsTrigger
          value="header-settings"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Impostazioni Header
        </TabsTrigger>
        <TabsTrigger
          value="site-settings"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Impostazioni Sito
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
        <TabsContent value="user-management" className="mt-0">
          <UserManagementView />
        </TabsContent>
        
        <TabsContent value="header-settings" className="mt-0">
          <HeaderSettingsView 
            uploadedLogo={uploadedLogo}
            setUploadedLogo={setUploadedLogo}
            headerColor={headerColor}
            setHeaderColor={setHeaderColor}
          />
        </TabsContent>
        
        <TabsContent value="site-settings" className="mt-0">
          <div className="w-full max-w-full">
            <h2 className="text-xl font-medium text-emerald-600 mb-4">
              Impostazioni del Sito (WIP)
            </h2>
            <p className="text-gray-500">
              Qui potrai gestire le impostazioni generali del sito, come il nome
              del sito, la lingua predefinita, ecc.
            </p>
          </div>
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

export default MasterPanel;
