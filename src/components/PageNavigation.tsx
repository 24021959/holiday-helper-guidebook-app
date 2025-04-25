
import React from "react";
import BackToMenu from "./BackToMenu";
import TranslatedText from "./TranslatedText";

interface PageNavigationProps {
  title: string;
}

const PageNavigation: React.FC<PageNavigationProps> = ({ title }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-100 to-teal-100 py-3 px-4 shadow-sm flex items-center">
      <BackToMenu />
      <h1 className="text-xl font-medium text-emerald-800 flex-1 text-center pr-6">
        <TranslatedText text={title} />
      </h1>
    </div>
  );
};

export default PageNavigation;
