
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin } from "@/context/AdminContext";
import ManagePagesView from "@/components/admin/ManagePagesView";
import MenuTranslationManager from "@/components/admin/MenuTranslationManager";
import AdminPanel from "@/components/admin/AdminPanel";
import { AdminSidebar } from "./AdminSidebar";
import MasterPanel from "./MasterPanel";

export const AdminContent: React.FC = () => {
  const { 
    activeTab, 
    showMasterPanel, 
    pages, 
    parentPages, 
    keywordToIconMap,
    handlePagesUpdate,
    userRole 
  } = useAdmin();

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <AdminSidebar />
      
      <div className="md:w-3/4 pl-0 md:pl-4">
        {activeTab === "user-management" && userRole === "master" ? (
          <MasterPanel />
        ) : (
          <Tabs value={activeTab} defaultValue={activeTab}>
            <TabsList className="hidden">
              <TabsTrigger value="pages">Pagine</TabsTrigger>
              <TabsTrigger value="translation">Traduzioni</TabsTrigger>
              <TabsTrigger value="settings">Impostazioni</TabsTrigger>
              {userRole === "master" && <TabsTrigger value="user-management">Gestione Utenti</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="pages" className="mt-2">
              <ManagePagesView
                pages={pages}
                onPagesUpdate={handlePagesUpdate}
                parentPages={parentPages}
                keywordToIconMap={keywordToIconMap}
              />
            </TabsContent>
            
            <TabsContent value="translation" className="mt-2">
              <MenuTranslationManager />
            </TabsContent>

            <TabsContent value="settings" className="mt-2">
              <AdminPanel />
            </TabsContent>
            
            {userRole === "master" && (
              <TabsContent value="user-management" className="mt-2">
                <MasterPanel />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
};
