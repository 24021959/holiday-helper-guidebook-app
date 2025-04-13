
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAdmin } from "@/context/AdminContext";
import ManagePagesView from "@/components/admin/ManagePagesView";
import MenuTranslationManager from "@/components/admin/MenuTranslationManager";
import AdminPanel from "@/components/admin/AdminPanel";
import { AdminSidebar } from "./AdminSidebar";

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
          // No content here since showMasterPanel should be false for regular admin users
          <div className="p-4 text-center">
            Questa sezione è riservata agli amministratori di sistema.
          </div>
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
