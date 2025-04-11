import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeaderSettingsView from "./HeaderSettingsView";
import FooterSettingsView from "./FooterSettingsView";
import UserManagementView from "./UserManagementView";
import ChatbotSettings from "./ChatbotSettings";
import { PageData } from "@/context/AdminContext";

const AdminPanel: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("header");

  const handleSettingsUpdate = (message: string, isError: boolean = false) => {
    if (isError) {
      setErrorMessage(message);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(message);
      setErrorMessage(null);
    }

    // Clear messages after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 5000);
  };

  return (
    <div>
      {successMessage && (
        <Alert className="my-4">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Successo</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="users">Utenti</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
        </TabsList>
        
        <TabsContent value="header">
          <HeaderSettingsView onSettingsUpdate={handleSettingsUpdate} />
        </TabsContent>
        
        <TabsContent value="footer">
          <FooterSettingsView onSettingsUpdate={handleSettingsUpdate} />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagementView />
        </TabsContent>
        
        <TabsContent value="chatbot">
          <ChatbotSettings onSettingsUpdate={handleSettingsUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
