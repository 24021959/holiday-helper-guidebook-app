
import React, { useRef } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import { Editor, EditorHandle } from "@/components/editor/Editor";
import { Badge } from "@/components/ui/badge";

// Schema for the form
const formSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  content: z.string().optional(),
});

interface PageFormProps {
  title: string;
  content: string;
  uploadedImage: string | null;
  hasUnsavedChanges: boolean;
  isSubmitting: boolean;
  pageLanguage?: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditorStateChange: (content: string) => void;
  onImageUpdate: (imageUrl: string) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export const PageForm: React.FC<PageFormProps> = ({
  title,
  content,
  uploadedImage,
  hasUnsavedChanges,
  isSubmitting,
  pageLanguage = 'it',
  onTitleChange,
  onEditorStateChange,
  onImageUpdate,
  onSubmit
}) => {
  const editorRef = useRef<EditorHandle>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: title,
      content: content,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  // Map language codes to names
  const languageNames: Record<string, string> = {
    it: 'Italiano',
    en: 'English',
    fr: 'Français',
    es: 'Español',
    de: 'Deutsch'
  };

  return (
    <Card className="border-emerald-100">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Modifica Pagina
          </h2>
          {pageLanguage && (
            <Badge className={`px-3 py-1 ${pageLanguage === 'it' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
              {languageNames[pageLanguage] || pageLanguage.toUpperCase()}
            </Badge>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
                        onTitleChange(e);
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
                <ImageUploader onImageUpload={onImageUpdate} />
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
                      onChange={onEditorStateChange}
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
  );
};
