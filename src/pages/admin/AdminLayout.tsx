
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  FolderOpen, 
  Settings, 
  MessageSquare, 
  BarChart3
} from "lucide-react";
import AdminCreate from "./AdminCreate";

const AdminLayout = () => {
  // We'll check for authentication here later
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Pannello di Amministrazione
        </h1>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="w-full bg-white/50 backdrop-blur-sm border border-gray-200">
            <TabsTrigger 
              value="create" 
              className="flex items-center gap-2 data-[state=active]:bg-green-100"
            >
              <FileText className="w-4 h-4" />
              <span>Crea Pagina</span>
            </TabsTrigger>
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
              value="create" 
              className="rounded-lg border border-green-100"
            >
              <AdminCreate />
            </TabsContent>

            <TabsContent 
              value="manage" 
              className="p-6 bg-blue-50/50 rounded-lg border border-blue-100"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Gestisci le pagine esistenti
              </h2>
              <div className="text-gray-600">
                Lista delle pagine e opzioni di gestione verranno aggiunte qui
              </div>
            </TabsContent>

            <TabsContent 
              value="settings" 
              className="p-6 bg-purple-50/50 rounded-lg border border-purple-100"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Impostazioni Header e Footer
              </h2>
              <div className="text-gray-600">
                Form per personalizzare header e footer verrà aggiunto qui
              </div>
            </TabsContent>

            <TabsContent 
              value="chatbot" 
              className="p-6 bg-yellow-50/50 rounded-lg border border-yellow-100"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Configurazione Chatbot
              </h2>
              <div className="text-gray-600">
                Impostazioni del chatbot verranno aggiunte qui
              </div>
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
