
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { LayoutSettingsForm } from "@/hooks/useLayoutSettings";

interface EstablishmentSettingsProps {
  form: UseFormReturn<LayoutSettingsForm>;
}

export const EstablishmentSettings = ({ form }: EstablishmentSettingsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="establishmentName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Azienda</FormLabel>
            <FormControl>
              <Input placeholder="Inserisci il nome della tua azienda" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="establishmentNameColor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Colore Testo Nome Azienda</FormLabel>
            <FormControl>
              <Input 
                type="color" 
                className="h-10 w-full p-1 cursor-pointer" 
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="establishmentNameAlignment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Allineamento Nome Azienda</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
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
        name="headerColor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Colore Sfondo Header</FormLabel>
            <FormControl>
              <Input 
                type="color" 
                className="h-10 w-full p-1 cursor-pointer" 
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
