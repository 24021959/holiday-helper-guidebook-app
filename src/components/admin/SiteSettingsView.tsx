
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";

const SiteSettingsView: React.FC = () => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-medium text-emerald-600 mb-4">
        Impostazioni del Sito
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Visualizza le statistiche di utilizzo del tuo sito. Questa funzionalità sarà disponibile a breve.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <BarChart className="h-4 w-4 mr-2" />
              Visualizza Analytics
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">SEO</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Configura le impostazioni SEO del tuo sito. Questa funzionalità sarà disponibile a breve.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Impostazioni SEO
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Impostazioni Generali</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            Qui potrai gestire le impostazioni generali del sito, come il nome del sito, la lingua predefinita, ecc.
            Questa funzionalità sarà presto disponibile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettingsView;
