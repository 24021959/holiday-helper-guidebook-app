
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Palette } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { LayoutSettingsForm } from "@/hooks/useLayoutSettings";

interface ThemeColorPickerProps {
  form: UseFormReturn<LayoutSettingsForm>;
  tempColor: string;
  onColorChange: (color: string) => void;
  onApplyColor: () => void;
  label?: string;
}

export const ThemeColorPicker = ({
  form,
  tempColor,
  onColorChange,
  onApplyColor,
  label = "Colore Sfondo"
}: ThemeColorPickerProps) => {
  return (
    <FormField
      control={form.control}
      name="themeColor"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            {label}
          </FormLabel>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <FormControl>
                <Input
                  type="color"
                  value={tempColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-full h-20 p-1 cursor-pointer"
                />
              </FormControl>
            </div>
            <Button
              type="button"
              onClick={onApplyColor}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Applica
            </Button>
          </div>
        </FormItem>
      )}
    />
  );
};
