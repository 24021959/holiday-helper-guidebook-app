
import React from 'react';
import { PageData } from "@/types/page.types";
import { EditForm } from './form/EditForm';
import { usePageCreation } from "@/hooks/usePageCreation";

interface EditPageFormProps {
  selectedPage: PageData;
  parentPages: PageData[];
  onPageUpdated: (pages: PageData[]) => void;
  keywordToIconMap: Record<string, string>;
  allPages?: PageData[];
}

const EditPageForm: React.FC<EditPageFormProps> = ({ 
  selectedPage,
  parentPages,
  onPageUpdated,
  keywordToIconMap,
  allPages = []
}) => {
  const { handleTranslateAndCreate } = usePageCreation({ 
    onPageCreated: onPageUpdated 
  });

  return (
    <EditForm
      selectedPage={selectedPage}
      parentPages={parentPages}
      onPageUpdated={onPageUpdated}
      handleTranslateAndCreate={handleTranslateAndCreate}
    />
  );
};

export default EditPageForm;
