
export interface ImageItem {
  url: string;
  position: "left" | "center" | "right" | "full";
  caption?: string;
  type: "image";
  width: string;
  insertInContent?: boolean;
  order?: number;
}

export interface ImageUploadItem {
  id: string;
  url: string;
  position: "left" | "center" | "right" | "full";
  caption: string;
  type?: string;
  insertInContent?: boolean;
  order?: number;
}

export interface ImageDetail {
  url: string;
  position: "left" | "center" | "right" | "full";
  caption?: string;
  width: string;
}
