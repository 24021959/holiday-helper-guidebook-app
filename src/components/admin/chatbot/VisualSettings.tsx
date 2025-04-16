
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Paintbrush } from "lucide-react";
import { ChatbotConfig } from "@/hooks/chatbot/chatbotTypes";

interface VisualSettingsProps {
  config: ChatbotConfig;
  onConfigChange: (field: keyof ChatbotConfig, value: any) => void;
}

const VisualSettings: React.FC<VisualSettingsProps> = ({ config, onConfigChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Paintbrush className="h-5 w-5 text-emerald-600" />
          <span>Aspetto Visuale</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Colore Sfondo Messaggi</Label>
            <div className="flex space-x-2">
              <Input
                type="color"
                value={config.messageBackgroundColor || '#ffffff'}
                onChange={(e) => onConfigChange('messageBackgroundColor', e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={config.messageBackgroundColor || '#ffffff'}
                onChange={(e) => onConfigChange('messageBackgroundColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Colore Testo Messaggi</Label>
            <div className="flex space-x-2">
              <Input
                type="color"
                value={config.messageTextColor || '#000000'}
                onChange={(e) => onConfigChange('messageTextColor', e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={config.messageTextColor || '#000000'}
                onChange={(e) => onConfigChange('messageTextColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Colore Sfondo Messaggi Utente</Label>
            <div className="flex space-x-2">
              <Input
                type="color"
                value={config.userMessageBackgroundColor || '#e5e7eb'}
                onChange={(e) => onConfigChange('userMessageBackgroundColor', e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={config.userMessageBackgroundColor || '#e5e7eb'}
                onChange={(e) => onConfigChange('userMessageBackgroundColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Colore Testo Messaggi Utente</Label>
            <div className="flex space-x-2">
              <Input
                type="color"
                value={config.userMessageTextColor || '#000000'}
                onChange={(e) => onConfigChange('userMessageTextColor', e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={config.userMessageTextColor || '#000000'}
                onChange={(e) => onConfigChange('userMessageTextColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisualSettings;
