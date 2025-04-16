
import React from "react";
import { VisualEditor } from "@/components/admin/VisualEditor";
import { ImageItem } from "@/types/image.types";
import { PageContent } from "@/pages/admin/AdminCreate";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { pageFormSchema } from '../schemas/pageFormSchema';

interface AdminPageContentProps {
  pageContent: PageContent;
  pageType: string;
  setPageContent: React.Dispatch<React.SetStateAction<PageContent>>;
  form: UseFormReturn<z.infer<typeof pageFormSchema>>;
}

export const AdminPageContent: React.FC<AdminPageContentProps> = ({
  pageContent,
  pageType,
  setPageContent,
  form
}) => {
  if (pageType === "parent") return null;

  return (
    <div className="border rounded-lg">
      <VisualEditor 
        content={pageContent.content}
        images={pageContent.images}
        onChange={(newContent) => {
          setPageContent(prev => ({
            ...prev,
            content: newContent
          }));
          form.setValue("content", newContent);
        }}
        onImageAdd={(imageDetail) => {
          const newImage: ImageItem = {
            ...imageDetail,
            type: "image",
            width: imageDetail.width || "100%"
          };
          setPageContent(prev => ({
            ...prev,
            images: [...prev.images, newImage]
          }));
        }}
      />
    </div>
  );
};
