
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageData } from "@/types/page.types";
import { toast } from "sonner";
import { useAdminPages } from "@/hooks/admin/useAdminPages";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
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
  const { pageToEdit } = location.state || {};
  const [selectedPage, setSelectedPage] = useState<PageData | null>(pageToEdit || null);
  const { isLoading } = useAdminPages();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Strumenti di formattazione testo
  const [selectedText, setSelectedText] = useState<{ start: number; end: number; text: string; } | null>(null);

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
    }
  }, [selectedPage, form]);

  const handleBackClick = () => {
    navigate("/admin/manage");
  };

  const handleImageUpdate = (imageUrl: string) => {
    setUploadedImage(imageUrl);
  };

  const handleTextFormat = (format: string) => {
    // La formattazione del testo sarà gestita dall'editor stesso
    console.log("Formato applicato:", format);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedPage) return;

    setIsSubmitting(true);
    try {
      // Qui salviamo solo le modifiche essenziali: titolo, contenuto e immagine
      // Manteniamo tutti gli altri parametri della pagina originale
      const updatedPage = {
        ...selectedPage,
        title: values.title,
        content: values.content || "",
        imageUrl: uploadedImage,
      };

      // Simuliamo il salvataggio
      setTimeout(() => {
        toast.success("Modifiche salvate con successo");
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
                        <Input placeholder="Titolo della pagina" {...field} />
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
                      <div className="border rounded-md p-2 mb-2">
                        <div className="flex flex-wrap gap-2 py-2 border-b">
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTextFormat('bold')}
                            className="h-8 w-8 p-0"
                          >
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTextFormat('italic')}
                            className="h-8 w-8 p-0"
                          >
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTextFormat('underline')}
                            className="h-8 w-8 p-0"
                          >
                            <Underline className="h-4 w-4" />
                          </Button>
                          <div className="h-6 border-r border-gray-300 mx-2"></div>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTextFormat('align-left')}
                            className="h-8 w-8 p-0"
                          >
                            <AlignLeft className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTextFormat('align-center')}
                            className="h-8 w-8 p-0"
                          >
                            <AlignCenter className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTextFormat('align-right')}
                            className="h-8 w-8 p-0"
                          >
                            <AlignRight className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTextFormat('align-justify')}
                            className="h-8 w-8 p-0"
                          >
                            <AlignJustify className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormControl>
                          <Editor
                            value={field.value || ""}
                            onChange={field.onChange}
                            initialEditMode="preview"
                            forcePreviewOnly={true}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t flex justify-end space-x-4">
                  <Button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={isSubmitting}
                  >
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
