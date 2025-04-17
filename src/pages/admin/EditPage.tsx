
import React from "react";
import { useLocation } from "react-router-dom";
import { useAdminPages } from "@/hooks/admin/useAdminPages";
import { PageHeader } from "@/components/admin/EditPage/PageHeader";
import { PageError } from "@/components/admin/EditPage/PageError";
import { PageLoading } from "@/components/admin/EditPage/PageLoading";
import { PageForm } from "@/components/admin/EditPage/PageForm";
import { useEditPageState } from "@/components/admin/EditPage/useEditPageState";

const EditPage = () => {
  const location = useLocation();
  const { pageToEdit } = location.state || {};
  const { isLoading } = useAdminPages();

  const {
    selectedPage,
    uploadedImage,
    isSubmitting,
    hasUnsavedChanges,
    editorContent,
    handleBackClick,
    handleImageUpdate,
    handleTitleChange,
    handleEditorStateChange,
    handleSubmit
  } = useEditPageState(pageToEdit);

  if (isLoading) {
    return <PageLoading />;
  }

  if (!selectedPage) {
    return <PageError handleBackClick={handleBackClick} />;
  }

  return (
    <div className="p-6">
      <PageHeader handleBackClick={handleBackClick} />

      <div className="container max-w-4xl mx-auto">
        <PageForm
          title={selectedPage.title}
          content={selectedPage.content}
          uploadedImage={uploadedImage}
          hasUnsavedChanges={hasUnsavedChanges}
          isSubmitting={isSubmitting}
          onTitleChange={handleTitleChange}
          onEditorStateChange={handleEditorStateChange}
          onImageUpdate={handleImageUpdate}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default EditPage;
