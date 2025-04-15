
export interface PageData {
  id: string;
  title: string;
  content: string;
  path: string;
  imageUrl: string | null;
  icon: string;
  listType?: "locations" | "activities" | "restaurants";
  listItems?: { name: string; description?: string; phoneNumber?: string; mapsUrl?: string; }[];
  isSubmenu: boolean;
  parentPath?: string;
  pageImages: { url: string; position: "top" | "center" | "bottom"; caption?: string; }[];
  published: boolean;
  is_parent: boolean;
}
