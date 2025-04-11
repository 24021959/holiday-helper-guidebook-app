
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { useAdmin } from "@/context/AdminContext";
import ManagePagesView from "@/components/admin/ManagePagesView";
import MenuTranslationManager from "@/components/admin/MenuTranslationManager";
import MasterPanel from "@/components/admin/MasterPanel";
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
          <MasterPanel />
        ) : (
          <>
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
          </>
        )}
      </div>
    </>
  );
};
