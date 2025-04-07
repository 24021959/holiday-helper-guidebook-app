
import React, { useState, useRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import ImageInsertionDialog from "./ImageInsertionDialog";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

interface PageContentSectionProps {
  name: string;
  label: string;
}

export const PageContentSection: React.FC<PageContentSectionProps> = ({
  name,
  label
}) => {
  const { control, setValue, getValues } = useFormContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [clickPosition, setClickPosition] = useState<number | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const handleInsertImageClick = () => {
    if (textareaRef.current) {
      setClickPosition(textareaRef.current.selectionStart);
      setShowImageDialog(true);
    }
  };

  const handleInsertImage = (imageUrl: string) => {
    try {
      const content = getValues(name) as string;
      if (clickPosition !== null) {
        // Create a shorter preview version if it's a base64 image
        let displayUrl = imageUrl;
        if (imageUrl.startsWith('data:image')) {
          displayUrl = '[Immagine]';
        }
        
        // Insert image markup at cursor position
        const imageMarkup = `\n![${displayUrl}](${imageUrl})\n`;
        const newContent = content.substring(0, clickPosition) + imageMarkup + content.substring(clickPosition);
        setValue(name, newContent, { shouldDirty: true });
        
        console.log("Immagine inserita correttamente come markdown:", displayUrl);
      }
    } catch (error) {
      console.error("Errore durante l'inserimento dell'immagine:", error);
    }
    setShowImageDialog(false);
  };

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="space-y-2">
              <FormControl>
                <Textarea
                  {...field}
                  ref={textareaRef}
                  className="min-h-[200px]"
                />
              </FormControl>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleInsertImageClick}
                className="flex items-center"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Inserisci immagine
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <ImageInsertionDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onImageUpload={handleInsertImage}
      />
    </>
  );
};
