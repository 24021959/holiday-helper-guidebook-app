import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // Changed from Toggle to Switch
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserManagementView } from "./UserManagementView";
import { UserData } from "@/pages/Admin";

interface MasterPanelProps {}

const MasterPanel: React.FC<MasterPanelProps> = () => {
  const [activeTab, setActiveTab] = useState<string>("user-management");
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-8 w-full justify-start border-b rounded-none bg-transparent h-auto pb-0">
        <TabsTrigger 
          value="user-management"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Gestione Utenti
        </TabsTrigger>
        <TabsTrigger
          value="site-settings"
          className="rounded-b-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-0 data-[state=active]:border-t-2 data-[state=active]:border-t-emerald-500"
        >
          Impostazioni Sito
        </TabsTrigger>
      </TabsList>
      
      <div className="bg-white shadow-md rounded-md p-6 border">
        <TabsContent value="user-management">
          <UserManagementView />
        </TabsContent>
        
        <TabsContent value="site-settings">
          <div>
            <h2 className="text-xl font-medium text-emerald-600 mb-4">
              Impostazioni del Sito (WIP)
            </h2>
            <p className="text-gray-500">
              Qui potrai gestire le impostazioni generali del sito, come il nome
              del sito, la lingua predefinita, ecc.
            </p>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default MasterPanel;
