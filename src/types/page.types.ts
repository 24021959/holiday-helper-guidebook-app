
// Aggiungiamo qui la definizione di PageType se non esiste già
export type PageType = "locations" | "activities" | "restaurants" | "generic";

export interface PageData {
  id: string;
  title: string;
  content: string;
  path: string;
  imageUrl?: string;
  icon?: string;
  listType?: "locations" | "activities" | "restaurants";
  listItems?: Record<string, any>[];
  isSubmenu?: boolean;
  parentPath?: string;
  pageImages?: { url: string; position: "left" | "center" | "right" | "full"; caption?: string }[];
  published?: boolean;
  is_parent?: boolean;
}

export interface PageFormValues {
  title: string;
  content: string;
  icon: string;
  pageType: PageType;
  parentPath?: string;
}
