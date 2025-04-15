
export type PageType = "normal" | "submenu" | "parent";

export interface PageFormValues {
  title: string;
  content: string;
  icon: string;
  pageType: PageType;
  parentPath?: string;
}
