
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { languages } from "./LanguageSelector";

interface LanguageTabsProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export const LanguageTabs = ({ currentLanguage, onLanguageChange }: LanguageTabsProps) => {
  return (
    <Tabs value={currentLanguage} onValueChange={onLanguageChange} className="w-full mb-6">
      <TabsList className="w-full">
        {languages.map((lang) => (
          <TabsTrigger 
            key={lang.code} 
            value={lang.code}
            className="flex items-center gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
