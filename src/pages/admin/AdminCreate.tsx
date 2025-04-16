
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageData } from "@/types/page.types";
import { AdminPageForm } from "@/components/admin/create/AdminPageForm";
import { ImageItem } from "@/types/image.types";
import { PageType } from "@/types/form.types";

export interface PageContent {
  title: string;
  content: string;
  images: ImageItem[];
  pageType: PageType;
  parentPath?: string;
}

interface AdminCreateProps {
  pageToEdit: PageData | null;
  onEditComplete: () => void;
}

const AdminCreate = ({ pageToEdit, onEditComplete }: AdminCreateProps) => {
  const [parentPages, setParentPages] = useState<PageData[]>([]);

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

  return (
    <div className="container mx-auto px-4 py-6">
      <AdminPageForm
        pageToEdit={pageToEdit}
        onEditComplete={onEditComplete}
        parentPages={parentPages}
      />
    </div>
  );
};

export default AdminCreate;
