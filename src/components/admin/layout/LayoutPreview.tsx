
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LayoutSettingsForm } from "@/hooks/useLayoutSettings";
import { UseFormWatch } from "react-hook-form";

interface LayoutPreviewProps {
  watch: UseFormWatch<LayoutSettingsForm>;
  previewHeaderColor: string;
  previewFooterColor: string;
  previewEstablishmentNameColor: string;
  previewFooterTextColor: string;
}

export const LayoutPreview = ({
  watch,
  previewHeaderColor,
  previewFooterColor,
  previewEstablishmentNameColor,
  previewFooterTextColor
}: LayoutPreviewProps) => {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-medium mb-2 text-gray-700">Anteprima Header</h3>
        <div className="rounded-lg overflow-hidden shadow-sm">
          <Header
            backgroundColor={previewHeaderColor}
            logoUrl={watch('logoUrl')}
            logoPosition={watch('logoPosition')}
            logoSize={watch('logoSize')}
            establishmentName={watch('establishmentName')}
            establishmentNameAlignment={watch('establishmentNameAlignment')}
            establishmentNameColor={previewEstablishmentNameColor}
          />
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-medium mb-2 text-gray-700">Anteprima Footer</h3>
        <div className="rounded-lg overflow-hidden shadow-sm">
          <Footer 
            backgroundColor={previewFooterColor} 
            textColor={previewFooterTextColor}
            textAlignment={watch('footerTextAlignment')}
          />
        </div>
      </div>
    </div>
  );
};
