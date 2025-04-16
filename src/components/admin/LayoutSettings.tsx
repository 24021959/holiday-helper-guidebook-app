
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useLayoutSettings } from "@/hooks/useLayoutSettings";
import { FooterSettings } from "./layout/FooterSettings";
import { LogoSettings } from "./layout/LogoSettings";
import { EstablishmentSettings } from "./layout/EstablishmentSettings";
import { LayoutPreview } from "./layout/LayoutPreview";

export const LayoutSettings = () => {
  const { 
    form, 
    previewHeaderColor, 
    previewFooterColor, 
    previewEstablishmentNameColor, 
    isLoading,
    onSubmit 
  } = useLayoutSettings();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Impostazioni Layout</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="border rounded-lg p-6 bg-white shadow-sm">
                <h3 className="text-lg font-medium mb-4">Impostazioni Azienda</h3>
                <EstablishmentSettings form={form} />
              </div>
              
              <div className="border rounded-lg p-6 bg-white shadow-sm">
                <h3 className="text-lg font-medium mb-4">Impostazioni Logo</h3>
                <LogoSettings form={form} />
              </div>
              
              <div className="border rounded-lg p-6 bg-white shadow-sm">
                <h3 className="text-lg font-medium mb-4">Impostazioni Footer</h3>
                <FooterSettings form={form} />
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="border rounded-lg p-6 bg-white shadow-sm sticky top-4">
                <h3 className="text-lg font-medium mb-4">Anteprima</h3>
                <LayoutPreview 
                  watch={form.watch}
                  previewHeaderColor={previewHeaderColor}
                  previewFooterColor={previewFooterColor}
                  previewEstablishmentNameColor={previewEstablishmentNameColor}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Salvataggio in corso..." : "Salva Impostazioni"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
