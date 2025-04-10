
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { type ChatbotConfig } from "./useChatbotConfig";

interface GeneralSettingsProps {
  config: ChatbotConfig;
  onConfigChange: (config: ChatbotConfig) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ config, onConfigChange }) => {
  const handleSwitchChange = (checked: boolean) => {
    onConfigChange({
      ...config,
      enabled: checked
    });
  };

  const handlePositionChange = (position: 'right' | 'left') => {
    onConfigChange({
      ...config,
      position
    });
  };

  const handleIconTypeChange = (iconType: 'default' | 'custom') => {
    onConfigChange({
      ...config,
      iconType
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Attiva Chatbot</h3>
          <p className="text-sm text-gray-500">
            Abilita o disabilita il chatbot sul tuo sito
          </p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={handleSwitchChange}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Impostazioni Generali</h3>
        
        <div className="space-y-2">
          <Label htmlFor="botName">Nome del Bot</Label>
          <Input
            id="botName"
            value={config.botName}
            onChange={(e) =>
              onConfigChange({
                ...config,
                botName: e.target.value
              })
            }
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
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  primaryColor: e.target.value
                })
              }
              className="w-16 h-10 p-1"
            />
            <Input
              value={config.primaryColor}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  primaryColor: e.target.value
                })
              }
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
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  secondaryColor: e.target.value
                })
              }
              className="w-16 h-10 p-1"
            />
            <Input
              value={config.secondaryColor}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  secondaryColor: e.target.value
                })
              }
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
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  customIconUrl: e.target.value
                })
              }
              placeholder="https://example.com/icon.png"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralSettings;
