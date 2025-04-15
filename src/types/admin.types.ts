
export interface PageData {
  id: string;
  title: string;
  content: string;
  path: string;
  imageUrl?: string | null;
  icon?: string;
  listType?: "locations" | "activities" | "restaurants";
  listItems?: {
    name: string;
    description?: string;
    phoneNumber?: string;
    mapsUrl?: string;
  }[];
  isSubmenu?: boolean;
  parentPath?: string;
  pageImages?: any[];
  published?: boolean;
  is_parent?: boolean;
}
