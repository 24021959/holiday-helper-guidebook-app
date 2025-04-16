
import React from 'react';
import { PageData } from "@/types/page.types";
import { EditForm } from './form/EditForm';
import { usePageCreation } from "@/hooks/usePageCreation";
import { ImageItem } from "@/types/image.types";
import { PageFormValues } from "@/types/form.types";

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

  // Wrapper per adattare la firma della funzione handleTranslateAndCreate
  const handleFormSubmit = async (
    values: PageFormValues,
    imageUrl: string | null,
    pageImages: ImageItem[],
    onSuccess: () => void
  ) => {
    return handleTranslateAndCreate(values, imageUrl, pageImages, onSuccess);
  };

  return (
    <EditForm
      selectedPage={selectedPage}
      parentPages={parentPages}
      onPageUpdated={onPageUpdated}
      handleTranslateAndCreate={handleFormSubmit}
    />
  );
};

export default EditPageForm;
