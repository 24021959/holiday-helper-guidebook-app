
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { PageData } from "@/types/page.types";
import { toast } from "sonner";
import { z } from "zod";

// Schema for the form
const formSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  content: z.string().optional(),
});

export const useEditPageState = (pageToEdit: PageData | null) => {
  const navigate = useNavigate();
  const [selectedPage, setSelectedPage] = useState<PageData | null>(pageToEdit || null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editorContent, setEditorContent] = useState<string>("");

  useEffect(() => {
    if (!selectedPage && !pageToEdit) {
      toast.error("Nessuna pagina selezionata per la modifica");
      navigate("/admin/manage");
    } else if (pageToEdit && !selectedPage) {
      setSelectedPage(pageToEdit);
    }

    // Set initial image
    if (pageToEdit?.imageUrl) {
      setUploadedImage(pageToEdit.imageUrl);
    }
  }, [selectedPage, pageToEdit, navigate]);

  useEffect(() => {
    // Update editor content when selectedPage changes
    if (selectedPage) {
      setEditorContent(selectedPage.content);
    }
  }, [selectedPage]);

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("Hai modifiche non salvate. Sei sicuro di voler uscire?")) {
        navigate("/admin/manage");
      }
    } else {
      navigate("/admin/manage");
    }
  };

  const handleImageUpdate = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasUnsavedChanges(true);
  };

  const handleEditorStateChange = (content: string) => {
    setEditorContent(content);
    // Don't auto-save, just track unsaved changes
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedPage) return;

    setIsSubmitting(true);
    try {
      // Simulate saving changes
      const updatedPage = {
        ...selectedPage,
        title: values.title,
        content: editorContent,
        imageUrl: uploadedImage,
      };

      setTimeout(() => {
        toast.success("Modifiche salvate con successo");
        setHasUnsavedChanges(false);
        navigate("/admin/manage");
        setIsSubmitting(false);
      }, 800);
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      toast.error("Errore durante il salvataggio delle modifiche");
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};
