
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useLayoutSettings } from "@/hooks/useLayoutSettings";
import { FooterSettings } from "./layout/FooterSettings";
import { LogoSettings } from "./layout/LogoSettings";
import { EstablishmentSettings } from "./layout/EstablishmentSettings";
import { LayoutPreview } from "./layout/LayoutPreview";
import { CheckCircle2, Loader2 } from "lucide-react";

export const LayoutSettings = () => {
  const { 
    form, 
    formLoaded,
    previewHeaderColor, 
    previewFooterColor, 
    previewEstablishmentNameColor,
    previewFooterTextColor,
    isLoading,
    isSuccess,
    onSubmit 
  } = useLayoutSettings();

  if (!formLoaded) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Caricamento impostazioni...</p>
      </div>
    );
  }

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
                  previewFooterTextColor={previewFooterTextColor}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio in corso...
              </span>
            ) : isSuccess ? (
              <span className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Impostazioni Salvate
              </span>
            ) : (
              "Salva Impostazioni"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};
