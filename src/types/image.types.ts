
export interface ImageDetail {
  url: string;
  position: "left" | "center" | "right" | "full";
  caption?: string;
  width: string;
  type?: "image";
}

export interface ImageItem extends ImageDetail {
  insertInContent?: boolean;
  order?: number;
}

export interface ImageUploadItem extends ImageDetail {
  file?: File;
  id?: string; // Added id property to fix build errors
}
