
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageData } from "@/types/page.types";
import { toast } from "sonner";
import { useAdminPages } from "@/hooks/admin/useAdminPages";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import ImageUploader from "@/components/ImageUploader";
import { Editor } from "@/components/editor/Editor";

// Schema semplificato per il form
const formSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  content: z.string().optional(),
});

const EditPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editorRef = useRef<any>(null);
  const { pageToEdit } = location.state || {};
  const [selectedPage, setSelectedPage] = useState<PageData | null>(pageToEdit || null);
  const { isLoading } = useAdminPages();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editorContent, setEditorContent] = useState<string>("");

  // Inizializza il form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: selectedPage?.title || "",
      content: selectedPage?.content || "",
    },
  });

  useEffect(() => {
    if (!selectedPage && !pageToEdit) {
      toast.error("Nessuna pagina selezionata per la modifica");
      navigate("/admin/manage");
    } else if (pageToEdit && !selectedPage) {
      setSelectedPage(pageToEdit);
    }

    // Imposta l'immagine iniziale
    if (pageToEdit?.imageUrl) {
      setUploadedImage(pageToEdit.imageUrl);
    }
  }, [selectedPage, pageToEdit, navigate]);

  useEffect(() => {
    // Aggiorna i valori del form quando cambia la pagina selezionata
    if (selectedPage) {
      form.reset({
        title: selectedPage.title,
        content: selectedPage.content,
      });
      setEditorContent(selectedPage.content);
    }
  }, [selectedPage, form]);

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
    form.setValue("title", e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleEditorStateChange = (content: string) => {
    setEditorContent(content);
    // Don't auto-save, just track unsaved changes
    setHasUnsavedChanges(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedPage) return;

    setIsSubmitting(true);
    try {
      // Get the latest content from the editor if it exists
      let finalContent = editorContent;
      if (editorRef.current && editorRef.current.getCurrentContent) {
        finalContent = editorRef.current.getCurrentContent();
      }

      // Qui salviamo solo le modifiche essenziali: titolo, contenuto e immagine
      // Manteniamo tutti gli altri parametri della pagina originale
      const updatedPage = {
        ...selectedPage,
        title: values.title,
        content: finalContent,
        imageUrl: uploadedImage,
      };

      // Simuliamo il salvataggio
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!selectedPage) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-300 p-4 rounded-md">
          <h2 className="text-red-600 font-medium text-lg">Errore</h2>
          <p className="text-red-500">Nessuna pagina selezionata per la modifica</p>
          <Button
            className="mt-4 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleBackClick}
          >
            Torna alla gestione pagine
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="outline"
          className="mb-4"
          onClick={handleBackClick}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla gestione pagine
        </Button>
      </div>

      <div className="container max-w-4xl mx-auto">
        <Card className="border-emerald-100">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titolo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Titolo della pagina" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleTitleChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Immagine Principale</FormLabel>
                  <div className="space-y-4">
                    {uploadedImage && (
                      <div className="mb-2">
                        <img 
                          src={uploadedImage} 
                          alt="Anteprima" 
                          className="w-full h-auto object-contain max-h-[300px] rounded-md"
                        />
                      </div>
                    )}
                    <ImageUploader onImageUpload={handleImageUpdate} />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenuto</FormLabel>
                      <FormControl>
                        <Editor
                          ref={editorRef}
                          value={field.value || ""}
                          onChange={handleEditorStateChange}
                          initialEditMode="visual"
                          forcePreviewOnly={false}
                          disableAutoSave={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t flex justify-end space-x-4">
                  {hasUnsavedChanges && (
                    <div className="flex-grow text-amber-600 flex items-center">
                      Modifiche non salvate
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Salvataggio..." : "Salva modifiche"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPage;
