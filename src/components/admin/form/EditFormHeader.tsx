
import React from 'react';
import { PageData } from "@/types/page.types";
import { PageTranslationsStatus } from './PageTranslationsStatus';

interface EditFormHeaderProps {
  selectedPage: PageData;
  isTranslating: boolean;
  availableTranslations: Record<string, boolean>;
  onTranslate: () => void;
}

export const EditFormHeader: React.FC<EditFormHeaderProps> = ({
  selectedPage,
  isTranslating,
  availableTranslations,
  onTranslate
}) => {
  const currentLanguage = getLanguageFromPath(selectedPage.path);
  
  return (
    <>
      <h2 className="text-xl font-medium text-emerald-600 mb-4">Modifica Pagina</h2>
      
      <PageTranslationsStatus 
        currentLanguage={currentLanguage}
        title={selectedPage.title}
        path={selectedPage.path}
        isTranslating={isTranslating}
        availableTranslations={availableTranslations}
        onTranslate={onTranslate}
      />
    </>
  );
};

const getLanguageFromPath = (path: string): string => {
  const match = path.match(/^\/([a-z]{2})\//);
  return match ? match[1] : 'it';
};
