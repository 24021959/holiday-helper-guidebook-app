
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserManagementView from "./UserManagementView";

interface MasterPanelProps {}

const MasterPanel: React.FC<MasterPanelProps> = () => {
  return (
    <div className="w-full">
      <Card className="border shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardTitle className="text-xl">
            Pannello Master - Gestione Utenti
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <UserManagementView />
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterPanel;
