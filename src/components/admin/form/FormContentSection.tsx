
import React from 'react';
import { Separator } from "@/components/ui/separator";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ImageUploadItem } from "@/types/image.types";
import ImagesUploader from "@/components/ImagesUploader";
import { Editor } from "@/components/editor/Editor";
import { pageFormSchema } from '../schemas/pageFormSchema';
import { z } from "zod";

type FormData = z.infer<typeof pageFormSchema>;

interface FormContentSectionProps {
  control: Control<FormData>;
  mainImage: string | null;
  pageImages: ImageUploadItem[];
  isUploading: boolean;
  onMainImageUpload: (file: File) => Promise<void>;
  onMainImageRemove: () => void;
  setPageImages: (images: ImageUploadItem[]) => void;
}

export const FormContentSection: React.FC<FormContentSectionProps> = ({
  control,
  mainImage,
  pageImages,
  isUploading,
  onMainImageUpload,
  onMainImageRemove,
  setPageImages
}) => {
  // Se control è null o undefined, mostra un messaggio di errore
  if (!control) {
    console.error("FormContentSection: control è null o undefined");
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50">
        <p className="text-red-500">Errore: form non inizializzato correttamente</p>
      </div>
    );
  }

  return (
    <>
      <Separator />
      <div className="grid grid-cols-1 gap-4">
        <div>
          <FormLabel>Immagine Principale</FormLabel>
          <FormDescription>
            Carica un'immagine da visualizzare in cima alla pagina.
          </FormDescription>
          <FormControl>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onMainImageUpload(e.target.files[0]);
                }
              }}
              className="hidden"
              id="image-upload"
            />
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                type="button"
                asChild
              >
                <label htmlFor="image-upload" className="cursor-pointer">
                  {isUploading ? "Caricando..." : "Carica Immagine"}
                </label>
              </Button>
              {mainImage && (
                <div className="relative">
                  <img
                    src={mainImage}
                    alt="Anteprima"
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="absolute top-0 right-0"
                    onClick={onMainImageRemove}
                  >
                    <span className="sr-only">Rimuovi</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          </FormControl>
        </div>

        <div>
          <FormLabel>Immagini nella pagina</FormLabel>
          <FormDescription>
            Aggiungi immagini da mostrare all'interno della pagina.
          </FormDescription>
          <FormControl>
            <ImagesUploader 
              images={pageImages} 
              onChange={setPageImages} 
            />
          </FormControl>
        </div>
      </div>

      <Separator />

      <FormField
        control={control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contenuto</FormLabel>
            <FormDescription>
              Scrivi il contenuto della pagina. Puoi usare Markdown per formattare
              il testo.
            </FormDescription>
            <FormControl>
              <div className="border rounded-lg">
                <Editor
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
