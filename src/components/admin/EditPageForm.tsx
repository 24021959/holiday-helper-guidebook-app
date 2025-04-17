
import React from 'react';
import { PageData } from "@/types/page.types";
import { z } from "zod";
import { PageForm } from './form/PageForm';
import { TranslationButton } from './form/TranslationButton';
import { useEditPageForm } from '@/hooks/admin/useEditPageForm';
import { pageFormSchema } from './schemas/pageFormSchema';
import { PageType } from "@/types/form.types";
import PagePreview from './form/PagePreview';

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
  // Check for selectedPage before rendering
  if (!selectedPage) {
    console.error("EditPageForm: selectedPage is null or undefined");
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50">
        <p className="text-red-500">Errore: nessuna pagina selezionata per la modifica</p>
      </div>
    );
  }

  const {
    isSubmitting,
    mainImage,
    currentLanguage,
    lastSavedValues,
    isCreating,
    isTranslating,
    handleMainImageUpload,
    handleMainImageRemove,
    handleFormSubmit,
    handleManualTranslate,
    previewOpen,
    setPreviewOpen,
    previewContent
  } = useEditPageForm({
    selectedPage,
    parentPages,
    onPageUpdated
  });

  // Initialize values from selectedPage with proper type casting
  const initialValues = {
    title: selectedPage.title,
    content: selectedPage.content,
    icon: selectedPage.icon || "FileText",
    pageType: (selectedPage.is_parent ? "parent" : selectedPage.isSubmenu ? "submenu" : "normal") as PageType,
    parentPath: selectedPage.parentPath,
  };

  const handleCancel = () => {
    // Just close or reset the form
  };

  const isHomePage = selectedPage.path === "/" || selectedPage.path.endsWith("/home");

  return (
    <div className="container max-w-4xl mx-auto">
      <h2 className="text-xl font-medium text-emerald-600 mb-4">
        {isHomePage ? "Modifica Pagina Home" : "Modifica Pagina"}
      </h2>
      
      <PageForm
        initialValues={initialValues}
        parentPages={parentPages.filter(page => page.id !== selectedPage.id)}
        isCreating={isCreating}
        isTranslating={isTranslating}
        isSubmitting={isSubmitting}
        mainImage={mainImage}
        onMainImageUpload={handleMainImageUpload}
        onMainImageRemove={handleMainImageRemove}
        onCancel={handleCancel}
        onSubmit={(values: z.infer<typeof pageFormSchema>, pageImages) => 
          handleFormSubmit(values, pageImages)
        }
        submitButtonText="Salva Modifiche"
      />

      <TranslationButton 
        isTranslating={isTranslating}
        onTranslate={handleManualTranslate}
        isVisible={!!lastSavedValues && currentLanguage === 'it'}
      />

      {previewOpen && (
        <PagePreview
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          content={previewContent}
          title={selectedPage.title}
        />
      )}
    </div>
  );
};

export default EditPageForm;
