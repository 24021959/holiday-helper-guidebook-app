
import React, { useState, useRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import ImageInsertionDialog from "./ImageInsertionDialog";

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

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const clickedPosition = textarea.selectionStart;
    setClickPosition(clickedPosition);
    setShowImageDialog(true);
  };

  const handleInsertImage = (imageUrl: string) => {
    const content = getValues(name) as string;
    if (clickPosition !== null) {
      // Insert image markup at cursor position
      const imageMarkup = `\n![Immagine](${imageUrl})\n`;
      const newContent = content.substring(0, clickPosition) + imageMarkup + content.substring(clickPosition);
      setValue(name, newContent, { shouldDirty: true });
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
            <FormControl>
              <Textarea
                {...field}
                ref={textareaRef}
                className="min-h-[200px]"
                onClick={handleTextareaClick}
              />
            </FormControl>
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
