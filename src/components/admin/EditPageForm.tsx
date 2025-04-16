import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageData } from "@/types/page.types";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageIconSection } from "./form/PageIconSection";
import { PageImageSection } from "./form/PageImageSection";
import { PageContentSection } from "./form/PageContentSection";
import { PageMultiImageSection, ImageItem } from "./form/PageMultiImageSection";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageTypeSection } from "./form/PageTypeSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Languages, Loader2 } from "lucide-react";
import { useTranslation } from "@/context/TranslationContext";

interface EditPageFormProps {
  selectedPage: PageData;
  parentPages: PageData[];
  onPageUpdated: (updatedPages: PageData[]) => void;
  keywordToIconMap: Record<string, string>;
  allPages?: PageData[];
}

const formSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  content: z.string().min(1, "Il contenuto è obbligatorio"),
  icon: z.string().optional(),
});

const supportedLanguages = {
  it: 'Italiano',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch'
};

type Language = 'it' | 'en' | 'fr' | 'es' | 'de';

const getLanguageFromPath = (path: string): string => {
  const match = path.match(/^\/([a-z]{2})\//);
  return match ? match[1] : 'it';
};

const normalizePath = (path: string): string => {
  return path.replace(/^\/[a-z]{2}/, '');
};

const EditPageForm: React.FC<EditPageFormProps> = ({ 
  selectedPage,
  parentPages,
  onPageUpdated,
  keywordToIconMap,
  allPages = []
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(selectedPage.icon || "FileText");
  const [uploadedImage, setUploadedImage] = useState<string | null>(selectedPage.imageUrl || null);
  const [pageImages, setPageImages] = useState<ImageItem[]>(selectedPage.pageImages || []);
  const [currentTab, setCurrentTab] = useState<string>("content");
  const [isTranslating, setIsTranslating] = useState(false);
  const [availableTranslations, setAvailableTranslations] = useState<Record<string, boolean>>({});

  const { translateSequential } = useTranslation();
  
  const initialPageType = selectedPage.is_parent ? "parent" : selectedPage.isSubmenu ? "submenu" : "normal";
  const [pageType, setPageType] = useState<"normal" | "submenu" | "parent">(initialPageType);
  const [parentPath, setParentPath] = useState<string>(selectedPage.parentPath || "");
  
  const currentLanguage = getLanguageFromPath(selectedPage.path);
  const normalizedPath = normalizePath(selectedPage.path);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: selectedPage.title,
      content: selectedPage.content,
      icon: selectedPage.icon || "FileText",
    },
  });

  useEffect(() => {
    const checkAvailableTranslations = async () => {
      try {
        const normalizedPath = normalizePath(selectedPage.path);
        
        if (allPages.length > 0) {
          const translations: Record<string, boolean> = {};
          
          Object.keys(supportedLanguages).forEach(lang => {
            const langPath = `/${lang}${normalizedPath}`;
            const exists = allPages.some(page => page.path === langPath);
            translations[lang] = !!exists;
          });
          
          setAvailableTranslations(translations);
          return;
        }
        
        const { data, error } = await supabase
          .from('custom_pages')
          .select('path')
          .like('path', `/%${normalizedPath}`);
          
        if (error) {
          console.error("Errore nel recupero delle traduzioni:", error);
          return;
        }
        
        const translations: Record<string, boolean> = {};
        
        Object.keys(supportedLanguages).forEach(lang => {
          const langPath = `/${lang}${normalizedPath}`;
          const exists = data?.some(page => page.path === langPath);
          translations[lang] = !!exists;
        });
        
        setAvailableTranslations(translations);
      } catch (error) {
        console.error("Errore nel controllo delle traduzioni disponibili:", error);
      }
    };
    
    checkAvailableTranslations();
  }, [selectedPage.path, allPages]);

  const formatPageContent = (content: string, images: ImageItem[]) => {
    let processedContent = content;
    
    const imageRegex = /<!-- IMAGE: (.*?) -->\n\[Immagine: .*?\]\n/g;
    processedContent = processedContent.replace(imageRegex, (match, url) => {
      return `\n![Image](${url})\n`;
    });
    
    const mapRegex = /<!-- MAP: (.*?) -->\n\[📍 (.*?)\]\n/g;
    processedContent = processedContent.replace(mapRegex, (match, url, name) => {
      return `\n[📍 ${name}](${url})\n`;
    });
    
    const phoneRegex = /<!-- PHONE: (.*?) -->\n\[📞 (.*?)\]\n/g;
    processedContent = processedContent.replace(phoneRegex, (match, number, label) => {
      return `\n[📞 ${label}](tel:${number})\n`;
    });
    
    if (images.length === 0) return processedContent;
    
    const contentImages = images
      .filter(img => img.insertInContent)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
      
    const galleryImages = images.filter(img => !img.insertInContent);
    
    if (contentImages.length === 0) {
      let enhancedContent = processedContent;
      enhancedContent += "\n\n<!-- IMAGES -->\n";
      
      galleryImages.forEach((image) => {
        const imageMarkup = JSON.stringify({
          type: "image",
          url: image.url,
          position: image.position,
          caption: image.caption || ""
        });
        
        enhancedContent += `\n${imageMarkup}\n`;
      });
      
      return enhancedContent;
    } else {
      const paragraphs = processedContent.split('\n').filter(p => p.trim() !== '');
      
      let newContent = '';
      let currentImageIndex = 0;
      let lastInsertedIndex = -1;
      
      paragraphs.forEach((paragraph, index) => {
        newContent += paragraph + '\n\n';
        
        while (
          currentImageIndex < contentImages.length && 
          (contentImages[currentImageIndex].order || 0) <= index && 
          (contentImages[currentImageIndex].order || 0) > lastInsertedIndex
        ) {
          const img = contentImages[currentImageIndex];
          const imgMarkdown = `<!-- IMAGE-CONTENT-${currentImageIndex} -->\n${JSON.stringify({
            type: "image",
            url: img.url,
            position: img.position,
            caption: img.caption || "",
            contentImage: true
          })}\n\n`;
          
          newContent += imgMarkdown;
          lastInsertedIndex = index;
          currentImageIndex++;
        }
      });
      
      if (currentImageIndex < contentImages.length) {
        while (currentImageIndex < contentImages.length) {
          const img = contentImages[currentImageIndex];
          const imgMarkdown = `<!-- IMAGE-CONTENT-${currentImageIndex} -->\n${JSON.stringify({
            type: "image",
            url: img.url,
            position: img.position,
            caption: img.caption || "",
            contentImage: true
          })}\n\n`;
          
          newContent += imgMarkdown;
          currentImageIndex++;
        }
      }
      
      if (galleryImages.length > 0) {
        newContent += "\n\n<!-- IMAGES -->\n";
        
        galleryImages.forEach((image) => {
          const imageMarkup = JSON.stringify({
            type: "image",
            url: image.url,
            position: image.position,
            caption: image.caption || ""
          });
          
          newContent += `\n${imageMarkup}\n`;
        });
      }
      
      return newContent;
    }
  };

  const handleImageInsertion = (imageId: number) => {
    if (imageId >= 0 && imageId < pageImages.length) {
      const updatedImages = [...pageImages];
      updatedImages[imageId] = {
        ...updatedImages[imageId],
        insertInContent: true,
        order: updatedImages.filter(img => img.insertInContent).length
      };
      setPageImages(updatedImages);
      
      setCurrentTab("images");
      
      toast.success("Immagine impostata per l'inserimento nel contenuto");
    }
  };

  const handleTranslateToAllLanguages = async () => {
    if (isTranslating) return;
    
    try {
      setIsTranslating(true);
      
      const formValues = form.getValues();
      const contentToTranslate = formValues.content;
      const titleToTranslate = formValues.title;
      
      const targetLangs: Language[] = ['en', 'fr', 'es', 'de'];
      
      toast.info("Avvio traduzione e sincronizzazione in tutte le lingue...");
      
      const translations = await translateSequential(
        contentToTranslate,
        titleToTranslate,
        targetLangs
      );
      
      for (const lang of targetLangs) {
        const translation = translations[lang];
        const targetPath = `/${lang}${normalizedPath}`;
        
        const { data: existingPage, error: queryError } = await supabase
          .from('custom_pages')
          .select('id')
          .eq('path', targetPath)
          .maybeSingle();
          
        if (queryError) {
          console.error(`Errore nella verifica della pagina in ${lang}:`, queryError);
          continue;
        }
        
        const pageData = {
          title: translation.title,
          content: formatPageContent(translation.content, pageImages),
          path: targetPath,
          image_url: uploadedImage,
          icon: selectedIcon,
          is_submenu: pageType === "submenu",
          parent_path: pageType === "submenu" ? parentPath.replace(/^\/[a-z]{2}/, `/${lang}`) : null,
          published: true,
          is_parent: pageType === "parent"
        };
        
        if (existingPage) {
          const { error: updateError } = await supabase
            .from('custom_pages')
            .update(pageData)
            .eq('id', existingPage.id);
            
          if (updateError) {
            console.error(`Errore nell'aggiornamento della pagina in ${lang}:`, updateError);
            toast.error(`Errore nell'aggiornamento della traduzione in ${supportedLanguages[lang]}`);
            continue;
          }
          
          const { error: menuError } = await supabase
            .from('menu_icons')
            .update({
              label: translation.title,
              icon: selectedIcon,
              parent_path: pageType === "submenu" ? parentPath.replace(/^\/[a-z]{2}/, `/${lang}`) : null,
              is_submenu: pageType === "submenu",
              is_parent: pageType === "parent"
            })
            .eq('path', targetPath);
            
          if (menuError) {
            console.error(`Errore nell'aggiornamento del menu in ${lang}:`, menuError);
          }
          
          console.log(`Aggiornata pagina in ${lang}: ${targetPath}`);
        } else {
          const { error: insertError } = await supabase
            .from('custom_pages')
            .insert({
              ...pageData,
              id: crypto.randomUUID()
            });
            
          if (insertError) {
            console.error(`Errore nella creazione della pagina in ${lang}:`, insertError);
            toast.error(`Errore nella creazione della traduzione in ${supportedLanguages[lang]}`);
            continue;
          }
          
          const { error: menuError } = await supabase
            .from('menu_icons')
            .insert({
              path: targetPath,
              label: translation.title,
              icon: selectedIcon,
              bg_color: "bg-blue-200",
              parent_path: pageType === "submenu" ? parentPath.replace(/^\/[a-z]{2}/, `/${lang}`) : null,
              is_submenu: pageType === "submenu",
              is_parent: pageType === "parent",
              published: true
            });
            
          if (menuError) {
            console.error(`Errore nella creazione del menu in ${lang}:`, menuError);
          }
          
          console.log(`Creata nuova pagina in ${lang}: ${targetPath}`);
        }
        
        setAvailableTranslations(prev => ({
          ...prev,
          [lang]: true
        }));
      }
      
      toast.success("Traduzioni completate e sincronizzate con successo");
      
      const { data: updatedPagesData, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*');
        
      if (fetchError) {
        console.error("Errore nel recupero delle pagine aggiornate:", fetchError);
      } else if (updatedPagesData) {
        const formattedPages = updatedPagesData.map(page => ({
          id: page.id,
          title: page.title,
          content: page.content,
          path: page.path,
          imageUrl: page.image_url,
          icon: page.icon,
          listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
          listItems: page.list_items as { name: string; description?: string; phoneNumber?: string; mapsUrl?: string; }[] | undefined,
          isSubmenu: page.is_submenu || false,
          parentPath: page.parent_path || undefined,
          pageImages: [],
          published: page.published,
          is_parent: false
        }));
        
        for (let i = 0; i < formattedPages.length; i++) {
          const page = formattedPages[i];
          const hasChildren = formattedPages.some(p => p.parentPath === page.path);
          
          if (hasChildren || (page.id === selectedPage.id && pageType === "parent")) {
            formattedPages[i] = { ...page, is_parent: true };
          }
        }
        
        onPageUpdated(formattedPages);
      }
      
    } catch (error) {
      console.error("Errore nella traduzione:", error);
      toast.error("Errore nella traduzione e sincronizzazione delle pagine");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUpdating(true);
      
      const formattedContent = formatPageContent(values.content, pageImages);
      
      const isSubmenu = pageType === "submenu";
      const isParent = pageType === "parent";
      
      const isItalian = !selectedPage.path.match(/^\/[a-z]{2}\//);
      
      const updateData = {
        title: values.title,
        content: formattedContent,
        image_url: uploadedImage,
        icon: selectedIcon,
        is_submenu: isSubmenu,
        parent_path: isSubmenu ? parentPath : null,
        is_parent: isParent
      };
      
      const { error: pageError } = await supabase
        .from('custom_pages')
        .update(updateData)
        .eq('id', selectedPage.id);
      
      if (pageError) {
        throw pageError;
      }
      
      const iconData = {
        label: values.title,
        icon: selectedIcon,
        bg_color: "bg-blue-200",
        parent_path: isSubmenu ? parentPath : null,
        is_submenu: isSubmenu,
        is_parent: isParent
      };
      
      const { error: iconError } = await supabase
        .from('menu_icons')
        .update(iconData)
        .eq('path', selectedPage.path);
      
      if (iconError) {
        console.error("Errore nell'aggiornamento dell'icona:", iconError);
      }
      
      if (isItalian) {
        toast.info("Pagina italiana aggiornata. Avvio sincronizzazione automatica delle traduzioni...");
        await handleTranslateToAllLanguages();
      }
      
      const { data: pagesData, error: fetchError } = await supabase
        .from('custom_pages')
        .select('*');
      
      if (fetchError) {
        throw fetchError;
      }
      
      if (pagesData) {
        const formattedPages = pagesData.map(page => ({
          id: page.id,
          title: page.title,
          content: page.content,
          path: page.path,
          imageUrl: page.image_url,
          icon: page.icon,
          listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
          listItems: page.list_items as { name: string; description?: string; phoneNumber?: string; mapsUrl?: string; }[] | undefined,
          isSubmenu: page.is_submenu || false,
          parentPath: page.parent_path || undefined,
          pageImages: [],
          published: page.published,
          is_parent: false
        }));
        
        for (let i = 0; i < formattedPages.length; i++) {
          const page = formattedPages[i];
          const hasChildren = formattedPages.some(p => p.parentPath === page.path);
          
          if (hasChildren || page.id === selectedPage.id && isParent) {
            formattedPages[i] = { ...page, is_parent: true };
          }
        }
        
        onPageUpdated(formattedPages);
        toast.success("Pagina aggiornata con successo");
      }
      
    } catch (error) {
      console.error("Errore nell'aggiornamento della pagina:", error);
      toast.error("Errore nell'aggiornamento della pagina");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <FormProvider {...form}>
      <h2 className="text-xl font-medium text-emerald-600 mb-4">Modifica Pagina</h2>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <Badge className="mb-2" variant="outline">
              {currentLanguage === 'it' ? 'Versione Italiana' : supportedLanguages[currentLanguage as keyof typeof supportedLanguages] || 'Versione Principale'}
            </Badge>
            <h3 className="text-lg font-medium">{selectedPage.title}</h3>
            <p className="text-sm text-gray-600">{selectedPage.path}</p>
          </div>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleTranslateToAllLanguages}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Languages className="h-4 w-4" />
            )}
            <span>{isTranslating ? "Traduzione in corso..." : "Traduci pagina"}</span>
          </Button>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <p className="text-sm text-gray-600 mr-2">Traduzioni disponibili:</p>
          {Object.entries(availableTranslations).map(([lang, exists]) => (
            lang !== currentLanguage && (
              <Badge 
                key={lang} 
                variant={exists ? 'default' : 'outline'} 
                className={exists ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'text-gray-600'}
              >
                {supportedLanguages[lang as keyof typeof supportedLanguages]}
              </Badge>
            )
          ))}
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
          
          <PageTypeSection 
            pageType={pageType}
            setPageType={setPageType}
            parentPath={parentPath}
            setParentPath={setParentPath}
            icon={selectedIcon}
            setIcon={setSelectedIcon}
            parentPages={parentPages.filter(p => p.id !== selectedPage.id)}
            control={form.control}
          />
          
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <PageIconSection 
                  icon={selectedIcon}
                  setIcon={(icon) => {
                    setSelectedIcon(icon);
                    field.onChange(icon);
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="content">Contenuto</TabsTrigger>
              <TabsTrigger value="images">Galleria Immagini</TabsTrigger>
              <TabsTrigger value="thumbnail">Immagine Principale</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              <PageContentSection 
                name="content" 
                label="Contenuto della pagina" 
                pageImages={pageImages}
                onInsertImage={handleImageInsertion}
              />
            </TabsContent>
            
            <TabsContent value="images">
              <PageMultiImageSection 
                images={pageImages}
                onImagesChange={setPageImages}
              />
            </TabsContent>
            
            <TabsContent value="thumbnail">
              <PageImageSection 
                imageUrl={uploadedImage}
                onImageUploaded={setUploadedImage}
              />
            </TabsContent>
          </Tabs>
          
          <div className="pt-4 border-t flex justify-end space-x-4">
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUpdating ? "Aggiornamento..." : "Salva modifiche"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};

export default EditPageForm;
