
import { useState, useEffect } from 'react';
import { ImageDetail } from '@/types/image.types';

export const useEditorPreview = (content: string, images: ImageDetail[]) => {
  const [formattedPreview, setFormattedPreview] = useState<string>('');

  useEffect(() => {
    const formatContent = () => {
      let formatted = content || '';
      
      // Process image JSON objects in content
      const regex = /\{\"type\":\"image\",.*?\}/g;
      let match;
      
      while ((match = regex.exec(formatted)) !== null) {
        try {
          const imageData = JSON.parse(match[0]);
          const positionClass = 
            imageData.position === "left" ? "float-left mr-4" : 
            imageData.position === "right" ? "float-right ml-4" : 
            imageData.position === "full" ? "w-full block" : 
            "mx-auto block";
          
          const imageHtml = `
            <figure class="${positionClass}" style="width: ${imageData.width || '50%'}; margin-bottom: 1rem; position: relative;">
              <img 
                src="${imageData.url}" 
                alt="${imageData.caption || 'Image'}" 
                class="w-full h-auto rounded-md" 
              />
              ${imageData.caption ? `<figcaption class="text-sm text-gray-500 mt-1">${imageData.caption}</figcaption>` : ''}
            </figure>
          `;
          
          formatted = formatted.replace(match[0], imageHtml);
        } catch (e) {
          console.error("Failed to parse image data:", e);
        }
      }
      
      // Replace image placeholders with actual images
      images.forEach((image, index) => {
        const positionClass = 
          image.position === "left" ? "float-left mr-4" : 
          image.position === "right" ? "float-right ml-4" : 
          image.position === "full" ? "w-full block" : 
          "mx-auto block";
        
        const imageHtml = `
          <figure class="${positionClass}" style="width: ${image.width}; margin-bottom: 1rem;">
            <img 
              src="${image.url}" 
              alt="${image.caption || `Image ${index+1}`}" 
              class="w-full h-auto rounded-md" 
              data-image-index="${index}"
            />
            ${image.caption ? `<figcaption class="text-sm text-gray-500 mt-1">${image.caption}</figcaption>` : ''}
          </figure>
        `;
        
        formatted = formatted.replace(`[IMMAGINE]`, imageHtml);
      });
      
      // Pre-process paragraphs - convert double newlines to paragraph markers
      formatted = formatted.replace(/\n\s*\n/g, "\n<p-break>\n");
      
      // Convert markdown-like formatting to HTML
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      formatted = formatted.replace(/__(.*?)__/g, '<u>$1</u>');
      
      // Convert phone numbers
      formatted = formatted.replace(/\[PHONE:(.*?):(.*?)\]/g, 
        '<a href="tel:$1" class="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200">' +
        '<span class="mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></span>' +
        '$2</a>');
      
      // Convert location/maps
      formatted = formatted.replace(/\[MAP:(.*?):(.*?)\]/g, 
        '<a href="$1" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">' +
        '<span class="mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>' +
        '$2</a>');
      
      // Convert headings
      formatted = formatted.replace(/## (.*?)(?:\n|$)/g, '<h2 class="text-xl font-bold my-3">$1</h2>');
      formatted = formatted.replace(/# (.*?)(?:\n|$)/g, '<h1 class="text-2xl font-bold my-4">$1</h1>');
      
      // Convert lists
      let bulletListRegex = /- (.*?)(?:\n|$)/g;
      let match2;
      let listItems = [];
      
      while ((match2 = bulletListRegex.exec(formatted)) !== null) {
        listItems.push(`<li>${match2[1]}</li>`);
      }
      
      if (listItems.length > 0) {
        const list = `<ul class="list-disc pl-5 my-2">${listItems.join('')}</ul>`;
        formatted = formatted.replace(/- .*?(?:\n|$)/g, '');
        formatted = formatted.replace(/BULLETS_PLACEHOLDER/, list);
      } else {
        formatted = formatted.replace(/BULLETS_PLACEHOLDER/, '');
      }
      
      // Convert ordered lists
      let orderedListRegex = /\d+\. (.*?)(?:\n|$)/g;
      let orderedListItems = [];
      let matchOrdered;
      
      while ((matchOrdered = orderedListRegex.exec(formatted)) !== null) {
        orderedListItems.push(`<li>${matchOrdered[1]}</li>`);
      }
      
      if (orderedListItems.length > 0) {
        const orderedList = `<ol class="list-decimal pl-5 my-2">${orderedListItems.join('')}</ol>`;
        formatted = formatted.replace(/\d+\. .*?(?:\n|$)/g, '');
        formatted = formatted + orderedList; // Append at the end
      }
      
      // Alignment classes
      formatted = formatted.replace(/\[ALIGN:left\](.*?)\[\/ALIGN\]/gs, '<div class="text-left">$1</div>');
      formatted = formatted.replace(/\[ALIGN:center\](.*?)\[\/ALIGN\]/gs, '<div class="text-center">$1</div>');
      formatted = formatted.replace(/\[ALIGN:right\](.*?)\[\/ALIGN\]/gs, '<div class="text-right">$1</div>');
      formatted = formatted.replace(/\[ALIGN:justify\](.*?)\[\/ALIGN\]/gs, '<div class="text-justify">$1</div>');
      
      // Process paragraphs - convert paragraph markers back to proper HTML paragraphs
      formatted = formatted.replace(/<p-break>/g, '</p><p class="mb-4">');
      
      // Wrap content in paragraph tags if not already wrapped
      if (!formatted.startsWith('<p') && !formatted.startsWith('<h') && !formatted.startsWith('<ul') && !formatted.startsWith('<ol')) {
        formatted = `<p class="mb-4">${formatted}`;
      }
      if (!formatted.endsWith('</p>') && !formatted.endsWith('</ul>') && !formatted.endsWith('</ol>')) {
        formatted = `${formatted}</p>`;
      }
      
      // Handle remaining line breaks
      formatted = formatted.replace(/\n/g, '<br>');
      
      // Remove any empty paragraphs
      formatted = formatted.replace(/<p class="mb-4"><\/p>/g, '');
      
      return formatted;
    };
    
    setFormattedPreview(formatContent());
  }, [content, images]);

  return {
    formattedPreview
  };
};
