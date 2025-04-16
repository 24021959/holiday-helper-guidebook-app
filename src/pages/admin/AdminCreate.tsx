
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageData } from "@/types/page.types";
import { AdminPageForm } from "@/components/admin/create/AdminPageForm";
import { ImageItem } from "@/types/image.types";
import { PageType } from "@/types/form.types";
import { usePageCreation } from "@/hooks/usePageCreation";

export interface PageContent {
  title: string;
  content: string;
  images: ImageItem[];
  pageType: PageType;
  parentPath?: string;
  icon: string;
}

interface AdminCreateProps {
  pageToEdit: PageData | null;
  onEditComplete: () => void;
}

const AdminCreate = ({ pageToEdit, onEditComplete }: AdminCreateProps) => {
  const [parentPages, setParentPages] = useState<PageData[]>([]);
  const { handleManualTranslation } = usePageCreation({
    onPageCreated: (pages) => {
      console.log("Pages updated after manual translation", pages);
    }
  });

  // CRITICAL: Imposta attributi globali per disabilitare le traduzioni
  useEffect(() => {
    // 1. Aggiungi attributo al body per bloccare traduzioni automatiche a livello globale
    document.body.setAttribute('data-no-translation', 'true');
    
    // 2. Aggiungi attributo anche all'elemento root dell'app
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.setAttribute('data-no-translation', 'true');
    }
    
    // 3. Aggiungi un attributo anche al div del container principale
    const mainContainer = document.querySelector('.container');
    if (mainContainer) {
      mainContainer.setAttribute('data-no-translation', 'true');
    }

    // 4. Add this attribute to ALL form elements
    document.querySelectorAll('form, input, textarea').forEach(el => {
      el.setAttribute('data-no-translation', 'true');
    });
    
    // 5. Add this attribute to any element with contenteditable attribute
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      el.setAttribute('data-no-translation', 'true');
    });
    
    // 6. Add a global data attribute to indicate this is an editor
    document.body.setAttribute('data-editor', 'true');
    
    // Rimuovi tutti gli attributi quando il componente viene smontato
    return () => {
      document.body.removeAttribute('data-no-translation');
      document.body.removeAttribute('data-editor');
      if (rootElement) {
        rootElement.removeAttribute('data-no-translation');
      }
      if (mainContainer) {
        mainContainer.removeAttribute('data-no-translation');
      }
      document.querySelectorAll('[data-no-translation="true"]').forEach(el => {
        el.removeAttribute('data-no-translation');
      });
    };
  }, []);

  // CRITICAL: Este effetto impedisce qualsiasi tentativo di traduzione
  useEffect(() => {
    const preventTranslation = (e: any) => {
      if (e.type === 'message' && e.data && e.data.action === 'translate') {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    
    window.addEventListener('message', preventTranslation, true);
    
    return () => {
      window.removeEventListener('message', preventTranslation, true);
    };
  }, []);

  useEffect(() => {
    const fetchParentPages = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_pages')
          .select('*')
          .eq('is_submenu', false);
        
        if (error) throw error;
        
        if (data) {
          const formattedPages = data.map(page => ({
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
            published: page.published || false,
            is_parent: page.is_parent || false
          }));
          
          setParentPages(formattedPages);
        }
      } catch (error) {
        console.error("Error fetching parent pages:", error);
        toast.error("Errore nel caricamento delle pagine genitore");
      }
    };
    
    fetchParentPages();
  }, []);

  // Handler for manual translation
  const handlePageManualTranslation = async (
    content: string,
    title: string,
    finalPath: string,
    imageUrl: string | null,
    icon: string,
    pageType: string,
    parentPath: string | null,
    pageImages: ImageItem[]
  ) => {
    try {
      await handleManualTranslation(
        content,
        title,
        finalPath,
        imageUrl,
        icon,
        pageType as PageType,
        parentPath,
        pageImages
      );
      
      toast.success("Pagina tradotta con successo in tutte le lingue");
    } catch (error) {
      console.error("Error translating page:", error);
      toast.error("Errore durante la traduzione della pagina");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6" data-no-translation="true" data-editor="true">
      <AdminPageForm
        pageToEdit={pageToEdit}
        onEditComplete={onEditComplete}
        parentPages={parentPages}
        onManualTranslate={handlePageManualTranslation}
      />
    </div>
  );
};

export default AdminCreate;
