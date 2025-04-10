
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

interface ChatbotConfig {
  enabled: boolean;
  welcomeMessage: Record<string, string>;
  primaryColor: string;
  secondaryColor: string;
  botName: string;
  position: 'right' | 'left';
  iconType: 'default' | 'custom';
  customIconUrl?: string;
}

interface ChatbotGeneralSettingsProps {
  config: ChatbotConfig;
  onConfigChange: (field: keyof ChatbotConfig, value: any) => void;
}

const ChatbotGeneralSettings: React.FC<ChatbotGeneralSettingsProps> = ({
  config,
  onConfigChange
}) => {
  const handlePositionChange = (position: 'right' | 'left') => {
    onConfigChange('position', position);
  };

  const handleIconTypeChange = (iconType: 'default' | 'custom') => {
    onConfigChange('iconType', iconType);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-emerald-600" />
          <span>Impostazioni Generali</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="botName">Nome del Bot</Label>
          <Input
            id="botName"
            value={config.botName}
            onChange={(e) => onConfigChange('botName', e.target.value)}
            placeholder="Assistente Virtuale"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryColor">Colore Principale</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="primaryColor"
              type="color"
              value={config.primaryColor}
              onChange={(e) => onConfigChange('primaryColor', e.target.value)}
              className="w-16 h-10 p-1"
            />
            <Input
              value={config.primaryColor}
              onChange={(e) => onConfigChange('primaryColor', e.target.value)}
              placeholder="#4ade80"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondaryColor">Colore Secondario</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="secondaryColor"
              type="color"
              value={config.secondaryColor}
              onChange={(e) => onConfigChange('secondaryColor', e.target.value)}
              className="w-16 h-10 p-1"
            />
            <Input
              value={config.secondaryColor}
              onChange={(e) => onConfigChange('secondaryColor', e.target.value)}
              placeholder="#ffffff"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Posizione del Chatbot</Label>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={config.position === 'right' ? 'default' : 'outline'}
              onClick={() => handlePositionChange('right')}
              className={config.position === 'right' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            >
              Destra
            </Button>
            <Button
              type="button"
              variant={config.position === 'left' ? 'default' : 'outline'}
              onClick={() => handlePositionChange('left')}
              className={config.position === 'left' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            >
              Sinistra
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tipo di Icona</Label>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={config.iconType === 'default' ? 'default' : 'outline'}
              onClick={() => handleIconTypeChange('default')}
              className={config.iconType === 'default' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            >
              Predefinita
            </Button>
            <Button
              type="button"
              variant={config.iconType === 'custom' ? 'default' : 'outline'}
              onClick={() => handleIconTypeChange('custom')}
              className={config.iconType === 'custom' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            >
              Personalizzata
            </Button>
          </div>
        </div>

        {config.iconType === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="customIconUrl">URL Icona Personalizzata</Label>
            <Input
              id="customIconUrl"
              value={config.customIconUrl || ''}
              onChange={(e) => onConfigChange('customIconUrl', e.target.value)}
              placeholder="https://example.com/icon.png"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatbotGeneralSettings;
