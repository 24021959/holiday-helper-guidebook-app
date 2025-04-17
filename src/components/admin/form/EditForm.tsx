
import React from 'react';
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PageData } from "@/types/page.types";
import { formSchema } from '../schemas/pageFormSchema';
import { PageFormValues, PageType } from "@/types/form.types";
import { EditFormHeader } from './EditFormHeader';
import { EditFormTypeSection } from './EditFormTypeSection';
import { EditFormTabs } from './EditFormTabs';
import { useEditFormState } from './useEditFormState';
import { ImageItem } from "@/types/image.types";

interface EditFormProps {
  selectedPage: PageData;
  parentPages: PageData[];
  onPageUpdated: (pages: PageData[]) => void;
  handleTranslateAndCreate: (values: PageFormValues, imageUrl: string | null, pageImages: ImageItem[], onSuccess: () => void) => Promise<void>;
}

export const EditForm: React.FC<EditFormProps> = ({ 
  selectedPage,
  parentPages,
  onPageUpdated,
  handleTranslateAndCreate
}: EditFormProps) => {
  const {
    currentTab,
    setCurrentTab,
    isTranslating,
    availableTranslations,
    selectedIcon,
    setSelectedIcon,
    uploadedImage,
    setUploadedImage,
    pageImages,
    pageType,
    setPageType,
    parentPath,
    setParentPath,
    handleFormSubmit,
    handleImageInsertion,
    handlePageImagesChange,
    initialPageType
  } = useEditFormState({
    selectedPage,
    handleTranslateAndCreate
  });
  
  // Initialize the form with the selected page values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: selectedPage.title,
      content: selectedPage.content,
      icon: selectedPage.icon || "FileText",
      pageType: initialPageType,
      parentPath: selectedPage.parentPath || "",
    },
  });

  React.useEffect(() => {
    // Ensure form is reset whenever selectedPage changes
    form.reset({
      title: selectedPage.title,
      content: selectedPage.content,
      icon: selectedPage.icon || "FileText",
      pageType: initialPageType,
      parentPath: selectedPage.parentPath || "",
    });
    
    setSelectedIcon(selectedPage.icon || "FileText");
    setUploadedImage(selectedPage.imageUrl || null);
  }, [selectedPage, setSelectedIcon, setUploadedImage, form, initialPageType]);

  // Wrap the submit handler to ensure it correctly processes the form values
  const onSubmit = form.handleSubmit((data) => {
    handleFormSubmit(data);
  });

  return (
    <div>
      <EditFormHeader 
        selectedPage={selectedPage}
        isTranslating={isTranslating}
        availableTranslations={availableTranslations}
        onTranslate={() => handleFormSubmit(form.getValues())}
      />
      
      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <EditFormTypeSection 
              pageType={pageType}
              setPageType={setPageType}
              parentPath={parentPath}
              setParentPath={setParentPath}
              icon={selectedIcon}
              setIcon={setSelectedIcon}
              parentPages={parentPages.filter(p => p.id !== selectedPage.id)}
              control={form.control}
            />
            
            <EditFormTabs 
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              pageImages={pageImages}
              handlePageImagesChange={handlePageImagesChange}
              handleImageInsertion={handleImageInsertion}
              uploadedImage={uploadedImage}
              setUploadedImage={setUploadedImage}
            />
            
            <div className="pt-4 border-t flex justify-end space-x-4">
              <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Salva modifiche
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
};
