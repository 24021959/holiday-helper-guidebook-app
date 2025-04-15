
import { ImageItem } from "@/types/image.types";

export interface CreatePageFormProps {
  parentPages: {
    id: string;
    title: string;
    content: string;
    path: string;
    imageUrl?: string;
    icon?: string;
    isSubmenu?: boolean;
    parentPath?: string | null;
    listItems?: any[];
    listType?: 'restaurants' | 'activities' | 'locations';
    pageImages?: ImageItem[];
    published?: boolean;
    is_parent?: boolean;
  }[];
  onPageCreated: (pages: any[]) => void;
  keywordToIconMap: Record<string, string>;
}

export interface PageFormData {
  title: string;
  content: string;
  icon: string;  // Changed from optional to required to fix build error
}
