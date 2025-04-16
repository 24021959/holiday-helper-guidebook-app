
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useLayoutSettings } from "@/hooks/useLayoutSettings";
import { FooterSettings } from "./layout/FooterSettings";
import { LogoSettings } from "./layout/LogoSettings";
import { EstablishmentSettings } from "./layout/EstablishmentSettings";
import { LayoutPreview } from "./layout/LayoutPreview";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const LayoutSettings = () => {
  const { 
    form, 
    formLoaded,
    loadError,
    previewHeaderColor, 
    previewFooterColor, 
    previewEstablishmentNameColor,
    previewFooterTextColor,
    isLoading,
    isSuccess,
    onSubmit 
  } = useLayoutSettings();

  const handleRetry = () => {
    window.location.reload();
  };

  if (loadError) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>
            {loadError}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRetry} className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" /> Riprova
        </Button>
      </div>
    );
  }

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
      {isSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Salvato</AlertTitle>
          <AlertDescription className="text-green-600">
            Le impostazioni sono state salvate con successo e saranno applicate a tutta l'applicazione.
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Impostazioni Azienda</h3>
                  <EstablishmentSettings form={form} />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Impostazioni Logo</h3>
                  <LogoSettings form={form} />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Impostazioni Footer</h3>
                  <FooterSettings form={form} />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-8">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Anteprima</h3>
                  <LayoutPreview 
                    watch={form.watch}
                    previewHeaderColor={previewHeaderColor}
                    previewFooterColor={previewFooterColor}
                    previewEstablishmentNameColor={previewEstablishmentNameColor}
                    previewFooterTextColor={previewFooterTextColor}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            size="lg"
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
