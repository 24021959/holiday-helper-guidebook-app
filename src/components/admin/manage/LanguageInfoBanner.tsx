
import { Languages } from "lucide-react";

export const LanguageInfoBanner = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <Languages className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            Gestione Pagine in Italiano
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>Le pagine sono gestite esclusivamente in italiano per questo sito.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
