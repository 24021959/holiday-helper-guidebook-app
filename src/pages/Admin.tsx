
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagementView } from "@/components/admin/UserManagementView";
import { ManagePagesView } from "@/components/admin/ManagePagesView"; 
import { HeaderSettingsView } from "@/components/admin/HeaderSettingsView";
import { ChatbotSettingsView } from "@/components/admin/ChatbotSettingsView";
import { CreatePageForm } from "@/components/admin/CreatePageForm";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export interface PageData {
  id: string;
  title: string;
  content: string;
  path: string;
  imageUrl?: string;
  isSubmenu?: boolean;
  parentPath?: string | null;
}

export interface UserData {
  id: string;
  email: string;
  isActive: boolean;
  role: string;
  createdAt: string;
}

export interface LocationItem {
  name: string;
  description: string;
  imageUrl?: string;
}

const Admin: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // For this demo, we'll use localStorage to check if admin is logged in
        const adminToken = localStorage.getItem("admin_token");
        
        if (!adminToken) {
          navigate("/login");
          return;
        }
        
        // Simple validation, could be enhanced with supabase auth
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    toast.success("Logout eseguito con successo");
    navigate("/login");
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">Pannello Amministratore</h1>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="create-page">
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
            <TabsTrigger 
              value="user-management"
              className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
            >
              Gestione Utenti
            </TabsTrigger>
          </TabsList>
          
          <div className="bg-white shadow-md rounded-md p-6 border">
            <TabsContent value="create-page">
              <CreatePageForm />
            </TabsContent>
            
            <TabsContent value="manage-pages">
              <ManagePagesView />
            </TabsContent>
            
            <TabsContent value="header-settings">
              <HeaderSettingsView />
            </TabsContent>
            
            <TabsContent value="chatbot-settings">
              <ChatbotSettingsView />
            </TabsContent>
            
            <TabsContent value="user-management">
              <UserManagementView />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
