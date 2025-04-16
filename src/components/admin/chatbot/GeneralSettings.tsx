
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatbotConfig } from "@/hooks/chatbot/chatbotTypes";

interface GeneralSettingsProps {
  config: ChatbotConfig;
  onConfigChange: (field: keyof ChatbotConfig, value: any) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ config, onConfigChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings2 className="h-5 w-5 text-emerald-600" />
          <span>Impostazioni Generali</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Abilita Chatbot</Label>
            <p className="text-sm text-gray-500">
              Mostra il chatbot sul sito web
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => onConfigChange('enabled', checked)}
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Bot Name */}
            <div className="space-y-2">
              <Label htmlFor="botName">Nome del Bot</Label>
              <input
                id="botName"
                value={config.botName}
                onChange={(e) => onConfigChange('botName', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Assistente Virtuale"
              />
            </div>

            {/* Primary Color */}
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Colore Primario</Label>
              <div className="flex space-x-2">
                <input
                  id="primaryColor"
                  type="color"
                  className="w-12 p-1 h-10"
                  value={config.primaryColor}
                  onChange={(e) => onConfigChange('primaryColor', e.target.value)}
                />
                <input
                  value={config.primaryColor}
                  onChange={(e) => onConfigChange('primaryColor', e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Posizione</Label>
          <div className="flex space-x-4">
            {['right', 'left'].map((pos) => (
              <Button
                key={pos}
                type="button"
                variant={config.position === pos ? 'default' : 'outline'}
                onClick={() => onConfigChange('position', pos)}
                className={config.position === pos ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
              >
                {pos === 'right' ? 'Destra' : 'Sinistra'}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
