export interface IconData {
  id: string;
  path: string;
  label: string;
  title?: string;
  icon: string;
  parent_path: string | null;
  bg_color?: string;
  published?: boolean;
  is_parent?: boolean;
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

export interface MenuIconsHookResult {
  icons: IconData[];
  isLoading: boolean;
  error: string | null;
  refreshIcons: () => void;
}
