export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      crm_automations: {
        Row: {
          action_type: string;
          created_at: string;
          delay_hours: number;
          id: string;
          is_active: boolean;
          name: string;
          store_id: string;
          template: string | null;
          trigger_type: string;
          updated_at: string;
        };
        Insert: {
          action_type: string;
          created_at?: string;
          delay_hours?: number;
          id?: string;
          is_active?: boolean;
          name: string;
          store_id: string;
          template?: string | null;
          trigger_type: string;
          updated_at?: string;
        };
        Update: {
          action_type?: string;
          created_at?: string;
          delay_hours?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          store_id?: string;
          template?: string | null;
          trigger_type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crm_automations_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      customers: {
        Row: {
          cpf: string | null;
          created_at: string;
          email: string | null;
          engagement_score: number;
          face_shape: string | null;
          id: string;
          last_purchase_at: string | null;
          ltv: number;
          name: string;
          nps_score: number | null;
          phone: string | null;
          preferences: Json;
          store_id: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          cpf?: string | null;
          created_at?: string;
          email?: string | null;
          engagement_score?: number;
          face_shape?: string | null;
          id?: string;
          last_purchase_at?: string | null;
          ltv?: number;
          name: string;
          nps_score?: number | null;
          phone?: string | null;
          preferences?: Json;
          store_id: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          cpf?: string | null;
          created_at?: string;
          email?: string | null;
          engagement_score?: number;
          face_shape?: string | null;
          id?: string;
          last_purchase_at?: string | null;
          ltv?: number;
          name?: string;
          nps_score?: number | null;
          phone?: string | null;
          preferences?: Json;
          store_id?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "customers_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          lens_config: Json | null;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          lens_config?: Json | null;
          order_id: string;
          product_id: string;
          quantity?: number;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          lens_config?: Json | null;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string;
          customer_id: string;
          discount: number;
          id: string;
          notes: string | null;
          order_number: string;
          payment_id: string | null;
          payment_method: string | null;
          payment_status: string;
          shipping_address: Json | null;
          shipping_cost: number;
          shipping_tracking: string | null;
          status: string;
          store_id: string;
          subtotal: number;
          total: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          customer_id: string;
          discount?: number;
          id?: string;
          notes?: string | null;
          order_number: string;
          payment_id?: string | null;
          payment_method?: string | null;
          payment_status?: string;
          shipping_address?: Json | null;
          shipping_cost?: number;
          shipping_tracking?: string | null;
          status?: string;
          store_id: string;
          subtotal: number;
          total: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          customer_id?: string;
          discount?: number;
          id?: string;
          notes?: string | null;
          order_number?: string;
          payment_id?: string | null;
          payment_method?: string | null;
          payment_status?: string;
          shipping_address?: Json | null;
          shipping_cost?: number;
          shipping_tracking?: string | null;
          status?: string;
          store_id?: string;
          subtotal?: number;
          total?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      prescriptions: {
        Row: {
          addition: number | null;
          created_at: string;
          customer_id: string;
          dnp: number | null;
          doctor_crm: string | null;
          doctor_name: string | null;
          expires_at: string | null;
          id: string;
          image_url: string | null;
          notes: string | null;
          od_axis: number | null;
          od_cylinder: number | null;
          od_sphere: number | null;
          os_axis: number | null;
          os_cylinder: number | null;
          os_sphere: number | null;
          prescription_date: string | null;
          store_id: string;
        };
        Insert: {
          addition?: number | null;
          created_at?: string;
          customer_id: string;
          dnp?: number | null;
          doctor_crm?: string | null;
          doctor_name?: string | null;
          expires_at?: string | null;
          id?: string;
          image_url?: string | null;
          notes?: string | null;
          od_axis?: number | null;
          od_cylinder?: number | null;
          od_sphere?: number | null;
          os_axis?: number | null;
          os_cylinder?: number | null;
          os_sphere?: number | null;
          prescription_date?: string | null;
          store_id: string;
        };
        Update: {
          addition?: number | null;
          created_at?: string;
          customer_id?: string;
          dnp?: number | null;
          doctor_crm?: string | null;
          doctor_name?: string | null;
          expires_at?: string | null;
          id?: string;
          image_url?: string | null;
          notes?: string | null;
          od_axis?: number | null;
          od_cylinder?: number | null;
          od_sphere?: number | null;
          os_axis?: number | null;
          os_cylinder?: number | null;
          os_sphere?: number | null;
          prescription_date?: string | null;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prescriptions_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prescriptions_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          brand: string | null;
          category: string;
          compare_price: number | null;
          created_at: string;
          description: string | null;
          description_seo: string | null;
          id: string;
          images: string[];
          is_active: boolean;
          name: string;
          price: number;
          sku: string | null;
          specs: Json;
          stock_qty: number;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          brand?: string | null;
          category: string;
          compare_price?: number | null;
          created_at?: string;
          description?: string | null;
          description_seo?: string | null;
          id?: string;
          images?: string[];
          is_active?: boolean;
          name: string;
          price: number;
          sku?: string | null;
          specs?: Json;
          stock_qty?: number;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          brand?: string | null;
          category?: string;
          compare_price?: number | null;
          created_at?: string;
          description?: string | null;
          description_seo?: string | null;
          id?: string;
          images?: string[];
          is_active?: boolean;
          name?: string;
          price?: number;
          sku?: string | null;
          specs?: Json;
          stock_qty?: number;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          store_id: string;
          endpoint: string;
          keys: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_id: string;
          endpoint: string;
          keys: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          store_id?: string;
          endpoint?: string;
          keys?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      seo_pages: {
        Row: {
          content_html: string | null;
          created_at: string;
          id: string;
          is_published: boolean;
          meta_description: string | null;
          page_type: string;
          schema_json: Json | null;
          slug: string;
          store_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          content_html?: string | null;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          meta_description?: string | null;
          page_type: string;
          schema_json?: Json | null;
          slug: string;
          store_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          content_html?: string | null;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          meta_description?: string | null;
          page_type?: string;
          schema_json?: Json | null;
          slug?: string;
          store_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seo_pages_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      store_members: {
        Row: {
          created_at: string;
          id: string;
          role: string;
          store_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: string;
          store_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: string;
          store_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_members_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      stores: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          logo_url: string | null;
          name: string;
          owner_id: string;
          plan: string;
          settings: Json;
          slug: string;
          updated_at: string;
          whatsapp_number: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name: string;
          owner_id: string;
          plan?: string;
          settings?: Json;
          slug: string;
          updated_at?: string;
          whatsapp_number?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name?: string;
          owner_id?: string;
          plan?: string;
          settings?: Json;
          slug?: string;
          updated_at?: string;
          whatsapp_number?: string | null;
        };
        Relationships: [];
      };
      whatsapp_conversations: {
        Row: {
          agent_state: string;
          created_at: string;
          customer_id: string | null;
          id: string;
          is_ai_active: boolean;
          last_message_at: string | null;
          phone: string;
          sentiment: string | null;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          agent_state?: string;
          created_at?: string;
          customer_id?: string | null;
          id?: string;
          is_ai_active?: boolean;
          last_message_at?: string | null;
          phone: string;
          sentiment?: string | null;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          agent_state?: string;
          created_at?: string;
          customer_id?: string | null;
          id?: string;
          is_ai_active?: boolean;
          last_message_at?: string | null;
          phone?: string;
          sentiment?: string | null;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "whatsapp_conversations_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      whatsapp_messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          media_type: string | null;
          media_url: string | null;
          role: string;
          tool_calls: Json | null;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          media_type?: string | null;
          media_url?: string | null;
          role: string;
          tool_calls?: Json | null;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          media_type?: string | null;
          media_url?: string | null;
          role?: string;
          tool_calls?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "whatsapp_conversations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      decrement_stock: {
        Args: { p_product_id: string; p_quantity: number };
        Returns: boolean;
      };
      restore_stock: {
        Args: { p_product_id: string; p_quantity: number };
        Returns: undefined;
      };
      user_is_owner_or_admin: {
        Args: { p_store_id: string };
        Returns: boolean;
      };
      user_store_ids: {
        Args: never;
        Returns: {
          store_id: string;
        }[];
      };
      user_store_role: { Args: { p_store_id: string }; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
