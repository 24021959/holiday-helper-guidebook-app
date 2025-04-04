
import React from "react";
import { UserManagementView } from "@/components/admin/UserManagementView";

const MasterPanel: React.FC = () => {
  return (
    <div className="bg-white shadow-md rounded-md p-6 border">
      <h2 className="text-xl font-medium text-purple-600 mb-6">Gestione Utenti (Pannello Master)</h2>
      <UserManagementView />
    </div>
  );
};

export default MasterPanel;
