
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { PageData } from "@/types/page.types";
import { ImageItem } from "@/types/image.types";
import { z } from "zod";
import { pageFormSchema } from '../schemas/pageFormSchema';
import { FormHeader } from '../form/FormHeader';
import { PageTypeSection } from '../form/PageTypeSection';
import { SelectedIconDisplay } from '../form/SelectedIconDisplay';
import { FormActions } from '../form/FormActions';
import { useAdminPageForm } from "@/hooks/admin/useAdminPageForm";
import { AdminPageContent } from "./AdminPageContent";

interface AdminPageFormProps {
  pageToEdit: PageData | null;
  onEditComplete: () => void;
  parentPages: PageData[];
}

export const AdminPageForm: React.FC<AdminPageFormProps> = ({
  pageToEdit,
  onEditComplete,
  parentPages
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string>(pageToEdit?.icon || "FileText");
  const {
    form,
    pageContent,
    uploadedImage,
    isCreating,
    isTranslating,
    handleSavePage,
    handleCancel,
    setPageContent,
  } = useAdminPageForm({ pageToEdit, onEditComplete });

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">
          {pageToEdit ? "Modifica pagina" : "Crea una nuova pagina"}
        </CardTitle>
        <CardDescription>
          {pageToEdit 
            ? "Modifica i contenuti della pagina esistente"
            : "Utilizza l'editor visuale per creare una nuova pagina"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSavePage)} className="space-y-6">
            <div className="space-y-6">
              <FormHeader control={form.control} />

              <PageTypeSection
                pageType={pageContent.pageType}
                setPageType={(type) => {
                  setPageContent(prev => ({
                    ...prev,
                    pageType: type,
                    parentPath: type === "normal" ? undefined : prev.parentPath
                  }));
                  form.setValue("pageType", type);
                }}
                parentPath={pageContent.parentPath || ""}
                setParentPath={(path) => {
                  setPageContent(prev => ({
                    ...prev,
                    parentPath: path
                  }));
                  form.setValue("parentPath", path);
                }}
                icon={selectedIcon}
                setIcon={setSelectedIcon}
                parentPages={parentPages}
                control={form.control}
              />

              <SelectedIconDisplay iconName={selectedIcon} />

              <AdminPageContent
                pageContent={pageContent}
                pageType={form.watch("pageType")}
                setPageContent={setPageContent}
                form={form}
              />

              <FormActions
                isSubmitting={isCreating || isTranslating}
                isCreating={isCreating}
                isTranslating={isTranslating}
                onCancel={handleCancel}
                submitText="Salva Pagina"
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
