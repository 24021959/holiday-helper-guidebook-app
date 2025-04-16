
import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export const useEditorContent = () => {
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  
  // Function to parse and render the content with previews
  const parseContent = (content: string) => {
    if (!content) return '';
    
    let parsedContent = content;
    
    // Replace image JSON objects with actual image previews
    const imageRegex = /\n\n({.*?"type":"image".*?})\n\n/g;
    parsedContent = parsedContent.replace(imageRegex, (match, jsonStr) => {
      try {
        const imageData = JSON.parse(jsonStr);
        if (imageData.type === "image") {
          const positionClass = 
            imageData.position === 'left' ? 'float-left mr-4 w-1/3' :
            imageData.position === 'right' ? 'float-right ml-4 w-1/3' :
            imageData.position === 'full' ? 'w-full my-4' :
            'mx-auto my-4 w-2/3';
          
          return `
            <div class="image-preview ${positionClass}" style="margin: 1rem 0; position: relative;">
              <img src="${imageData.url}" alt="${imageData.caption || 'Image'}" style="max-width: 100%; border-radius: 4px;" />
              ${imageData.caption ? `<div style="text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">${imageData.caption}</div>` : ''}
            </div>
          `;
        }
      } catch (e) {
        console.error("Error parsing image data", e);
      }
      return match;
    });
    
    // Format paragraphs
    parsedContent = parsedContent.replace(/\n\n/g, '</p><p>');
    parsedContent = `<p>${parsedContent}</p>`;
    
    return parsedContent;
  };
  
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `lovable-uploads/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('public').getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Errore durante il caricamento dell'immagine");
      throw error;
    }
  };
  
  const insertImageAtCursor = (content: string, imageData: string, position: number | null) => {
    if (position === null && position !== 0) return content;
    
    return (
      content.substring(0, position) + 
      "\n\n" + imageData + "\n\n" + 
      content.substring(position)
    );
  };

  return {
    cursorPosition,
    setCursorPosition,
    parseContent,
    uploadImageToSupabase,
    insertImageAtCursor
  };
};
