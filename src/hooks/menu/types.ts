
export interface IconData {
  id: string;
  path: string;
  parent_path: string | null;
  label: string;
  icon: string;
  bg_color: string;
  published: boolean;
  is_submenu?: boolean;
  is_parent?: boolean;
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
