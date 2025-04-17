
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FolderOpen, 
  Settings, 
  MessageSquare, 
  BarChart3
} from "lucide-react";
import AdminManage from "./AdminManage";
import { LayoutSettings } from "@/components/admin/LayoutSettings";
import { toast } from "sonner";
import ChatbotSettings from "@/components/admin/chatbot/ChatbotSettings";

const AdminLayout = () => {
  const isAuthenticated = true;
  const [activeTab, setActiveTab] = useState("manage");

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['manage', 'settings', 'chatbot', 'analytics'].includes(hash)) {
      setActiveTab(hash);
    }
    
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && ['manage', 'settings', 'chatbot', 'analytics'].includes(newHash)) {
        setActiveTab(newHash);
      }
    });
  }, []);

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Pannello di Amministrazione
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-white/50 backdrop-blur-sm border border-gray-200">
            <TabsTrigger 
              value="manage" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-100"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Gestisci Pagine</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-100"
            >
              <Settings className="w-4 h-4" />
              <span>Impostazioni Layout</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chatbot" 
              className="flex items-center gap-2 data-[state=active]:bg-yellow-100"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Gestione Chatbot</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-pink-100"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent 
              value="manage" 
              className="rounded-lg border border-blue-100"
            >
              <AdminManage />
            </TabsContent>

            <TabsContent 
              value="settings" 
              className="rounded-lg border border-purple-100"
            >
              <LayoutSettings />
            </TabsContent>

            <TabsContent 
              value="chatbot" 
              className="p-6 bg-yellow-50/50 rounded-lg border border-yellow-100"
            >
              <ChatbotSettings />
            </TabsContent>

            <TabsContent 
              value="analytics" 
              className="p-6 bg-pink-50/50 rounded-lg border border-pink-100"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Analytics e Statistiche
              </h2>
              <div className="text-gray-600">
                Dashboard analytics verrà aggiunta qui
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminLayout;

