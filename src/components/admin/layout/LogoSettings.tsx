
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/ImageUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { LayoutSettingsForm } from "../LayoutSettings";

interface LogoSettingsProps {
  form: UseFormReturn<LayoutSettingsForm>;
}

export const LogoSettings = ({ form }: LogoSettingsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="logoUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Logo</FormLabel>
            <FormControl>
              <ImageUploader onImageUpload={(url) => field.onChange(url)} />
            </FormControl>
            {field.value && (
              <div className="mt-2 relative">
                <img
                  src={field.value}
                  alt="Logo anteprima"
                  className="h-16 object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-0 right-0"
                  onClick={() => field.onChange("")}
                >
                  Rimuovi
                </Button>
              </div>
            )}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="logoPosition"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Posizione Logo</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">
                  <span className="flex items-center gap-2">
                    <AlignLeft className="w-4 h-4" />
                    Sinistra
                  </span>
                </SelectItem>
                <SelectItem value="center">
                  <span className="flex items-center gap-2">
                    <AlignCenter className="w-4 h-4" />
                    Centro
                  </span>
                </SelectItem>
                <SelectItem value="right">
                  <span className="flex items-center gap-2">
                    <AlignRight className="w-4 h-4" />
                    Destra
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="logoSize"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dimensione Logo</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Piccolo</SelectItem>
                <SelectItem value="medium">Medio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </>
  );
};
