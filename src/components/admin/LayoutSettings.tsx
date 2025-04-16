
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useLayoutSettings } from "@/hooks/useLayoutSettings";
import { FooterSettings } from "./layout/FooterSettings";
import { LogoSettings } from "./layout/LogoSettings";
import { EstablishmentSettings } from "./layout/EstablishmentSettings";
import { LayoutPreview } from "./layout/LayoutPreview";

export const LayoutSettings = () => {
  const { form, previewHeaderColor, previewFooterColor, previewEstablishmentNameColor, onSubmit } = useLayoutSettings();

  return (
    <div className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <EstablishmentSettings form={form} />
          <LogoSettings form={form} />
          <FooterSettings form={form} />
          
          <LayoutPreview 
            watch={form.watch}
            previewHeaderColor={previewHeaderColor}
            previewFooterColor={previewFooterColor}
            previewEstablishmentNameColor={previewEstablishmentNameColor}
          />

          <Button type="submit" className="w-full">
            Salva Impostazioni
          </Button>
        </form>
      </Form>
    </div>
  );
};
