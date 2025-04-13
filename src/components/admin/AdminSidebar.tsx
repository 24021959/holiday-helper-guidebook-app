
import React from "react";
import { FileText, Globe, Settings } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin } from "@/context/AdminContext";

export const AdminSidebar: React.FC = () => {
  const { activeTab, setActiveTab, setShowMasterPanel, userRole } = useAdmin();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowMasterPanel(false);
  };

  // Mostra solo i tab appropriati in base al ruolo dell'utente
  const leftColTabs = [
    {
      value: "pages",
      label: "Pagine",
      icon: <FileText className="h-5 w-5" />
    },
    {
      value: "translation",
      label: "Traduzioni",
      icon: <Globe className="h-5 w-5" />
    },
    {
      value: "settings",
      label: "Impostazioni",
      icon: <Settings className="h-5 w-5" />
    }
  ];

  return (
    <aside className="md:w-1/4 pr-4">
      <Card className="shadow-md border-0">
        <CardHeader className="py-2">
          <CardTitle className="text-lg font-semibold">Gestione</CardTitle>
          <CardDescription>
            Seleziona la sezione da gestire
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col h-full">
            <TabsList className="flex flex-col space-y-1 border-r-2 border-gray-200 pr-4">
              {leftColTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`flex items-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted hover:text-muted-foreground ${activeTab === tab.value ? 'bg-secondary text-secondary-foreground' : ''}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
    </aside>
  );
};
