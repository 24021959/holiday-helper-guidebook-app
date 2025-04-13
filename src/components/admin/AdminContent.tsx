
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
    handlePagesUpdate 
  } = useAdmin();

  return (
    <>
      <AdminSidebar />
      
      <div className="md:w-3/4 pl-4">
        {showMasterPanel ? (
          <MasterPanel />
        ) : (
          <Tabs value={activeTab} defaultValue={activeTab}>
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
          </Tabs>
        )}
      </div>
    </>
  );
};
