export interface ImageDetail {
  id?: string;
  url: string;
  position: "left" | "center" | "right" | "full";
  caption?: string;
  width: string;
  type?: "image";
  name?: string;
}

export interface ImageItem extends ImageDetail {
  insertInContent?: boolean;
  order?: number;
}

export interface ImageUploadItem extends ImageDetail {
  file?: File;
  id?: string;
}
