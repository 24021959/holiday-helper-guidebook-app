export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean
          password_hash: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean
          password_hash: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean
          password_hash?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chatbot_conversations: {
        Row: {
          bot_response: string
          conversation_id: string
          corrected_response: string | null
          created_at: string | null
          feedback: string | null
          id: string
          matched_documents: Json | null
          metadata: Json | null
          updated_at: string | null
          user_message: string
          was_helpful: boolean | null
        }
        Insert: {
          bot_response: string
          conversation_id: string
          corrected_response?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          matched_documents?: Json | null
          metadata?: Json | null
          updated_at?: string | null
          user_message: string
          was_helpful?: boolean | null
        }
        Update: {
          bot_response?: string
          conversation_id?: string
          corrected_response?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          matched_documents?: Json | null
          metadata?: Json | null
          updated_at?: string | null
          user_message?: string
          was_helpful?: boolean | null
        }
        Relationships: []
      }
      chatbot_knowledge: {
        Row: {
          content: string
          created_at: string | null
          id: string
          language: string
          metadata: Json | null
          page_id: string
          path: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          language?: string
          metadata?: Json | null
          page_id: string
          path: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          language?: string
          metadata?: Json | null
          page_id?: string
          path?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chatbot_settings: {
        Row: {
          code: string | null
          created_at: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      chatbot_stats: {
        Row: {
          average_response_time: number | null
          created_at: string | null
          date: string
          helpful_responses: number | null
          id: string
          total_conversations: number | null
          total_messages: number | null
          unhelpful_responses: number | null
          updated_at: string | null
        }
        Insert: {
          average_response_time?: number | null
          created_at?: string | null
          date?: string
          helpful_responses?: number | null
          id?: string
          total_conversations?: number | null
          total_messages?: number | null
          unhelpful_responses?: number | null
          updated_at?: string | null
        }
        Update: {
          average_response_time?: number | null
          created_at?: string | null
          date?: string
          helpful_responses?: number | null
          id?: string
          total_conversations?: number | null
          total_messages?: number | null
          unhelpful_responses?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_pages: {
        Row: {
          content: string
          created_at: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_parent: boolean | null
          is_submenu: boolean | null
          list_items: Json | null
          list_type: string | null
          parent_path: string | null
          path: string
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_parent?: boolean | null
          is_submenu?: boolean | null
          list_items?: Json | null
          list_type?: string | null
          parent_path?: string | null
          path: string
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_parent?: boolean | null
          is_submenu?: boolean | null
          list_items?: Json | null
          list_type?: string | null
          parent_path?: string | null
          path?: string
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      header_settings: {
        Row: {
          created_at: string | null
          establishment_name: string | null
          establishment_name_alignment: string
          header_color: string | null
          id: number
          logo_position: string | null
          logo_size: string | null
          logo_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          establishment_name?: string | null
          establishment_name_alignment?: string
          header_color?: string | null
          id?: number
          logo_position?: string | null
          logo_size?: string | null
          logo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          establishment_name?: string | null
          establishment_name_alignment?: string
          header_color?: string | null
          id?: number
          logo_position?: string | null
          logo_size?: string | null
          logo_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_icons: {
        Row: {
          bg_color: string
          created_at: string | null
          icon: string
          id: string
          is_parent: boolean | null
          is_submenu: boolean | null
          label: string
          parent_path: string | null
          path: string
          published: boolean | null
          updated_at: string | null
        }
        Insert: {
          bg_color: string
          created_at?: string | null
          icon: string
          id?: string
          is_parent?: boolean | null
          is_submenu?: boolean | null
          label: string
          parent_path?: string | null
          path: string
          published?: boolean | null
          updated_at?: string | null
        }
        Update: {
          bg_color?: string
          created_at?: string | null
          icon?: string
          id?: string
          is_parent?: boolean | null
          is_submenu?: boolean | null
          label?: string
          parent_path?: string | null
          path?: string
          published?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
