
import { Language } from "@/types/translation.types";

export interface IconData {
  id: string;
  path: string;
  label: string;
  title?: string;
  icon: string;
  parent_path: string | null;
  published?: boolean;
  is_parent?: boolean;
  bg_color?: string;
}

export interface MenuIconsProps {
  parentPath: string | null;
  refreshTrigger?: number;
}

export interface LanguageStats {
  totalPages: number;
  translatedPages: number;
}

export interface TranslationProgress {
  total: number;
  completed: number;
  currentPage?: string;
}

export type Languages = Record<Language, boolean | LanguageStats | TranslationProgress>;
