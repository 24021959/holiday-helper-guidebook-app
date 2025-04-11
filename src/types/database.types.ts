
export type Table = {
  custom_pages: {
    id: string;
    title: string;
    content: string;
    path: string;
    image_url: string | null;
    icon: string;
    parent_path: string | null;
    is_submenu: boolean;
    published: boolean;
    list_type?: string;
    list_items?: any[];
    created_at?: string;
    updated_at?: string;
  };
  
  menu_icons: {
    id: string;
    path: string;
    label: string;
    icon: string;
    bg_color: string;
    parent_path: string | null;
    published: boolean;
    is_submenu?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  
  header_settings: {
    id: number;
    logo_url: string | null;
    header_color: string;
    establishment_name: string;
    logo_position: "left" | "center" | "right";
    logo_size: "small" | "medium" | "large";
    created_at?: string;
    updated_at?: string;
  };
  
  chatbot_settings: {
    id: number;
    code: string | null;
    created_at?: string;
    updated_at?: string;
  };
  
  site_settings: {
    id: number;
    key: string;
    value: any;
    created_at?: string;
    updated_at?: string;
  };
};

export type Tables = {
  [TableName in keyof Table]: Table[TableName]
};
