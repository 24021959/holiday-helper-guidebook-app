
import React from 'react';
import { PageData } from "@/types/page.types";
import { PageTypeSection } from './PageTypeSection';
import { PageIconSection } from './PageIconSection';

interface EditFormTypeSectionProps {
  pageType: "normal" | "submenu" | "parent";
  setPageType: (type: "normal" | "submenu" | "parent") => void;
  parentPath: string;
  setParentPath: (path: string) => void;
  icon: string;
  setIcon: (icon: string) => void;
  parentPages: PageData[];
  control: any;
}

export const EditFormTypeSection: React.FC<EditFormTypeSectionProps> = ({
  pageType,
  setPageType,
  parentPath,
  setParentPath,
  icon,
  setIcon,
  parentPages,
  control
}) => {
  return (
    <>
      <PageTypeSection 
        pageType={pageType}
        setPageType={setPageType}
        parentPath={parentPath}
        setParentPath={setParentPath}
        icon={icon}
        setIcon={setIcon}
        parentPages={parentPages}
        control={control}
      />
      
      <PageIconSection 
        icon={icon}
        setIcon={setIcon}
      />
    </>
  );
};
