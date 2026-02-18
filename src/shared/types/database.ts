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
      audit_logs: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
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
      experiments: {
        Row: {
          id: string;
          key: string;
          name: string;
          description: string | null;
          variants: Json;
          is_active: boolean;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          description?: string | null;
          variants?: Json;
          is_active?: boolean;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          name?: string;
          description?: string | null;
          variants?: Json;
          is_active?: boolean;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      feature_flags: {
        Row: {
          id: string;
          key: string;
          name: string;
          description: string | null;
          is_enabled: boolean;
          rollout_percentage: number;
          allowed_organizations: string[];
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          description?: string | null;
          is_enabled?: boolean;
          rollout_percentage?: number;
          allowed_organizations?: string[];
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          name?: string;
          description?: string | null;
          is_enabled?: boolean;
          rollout_percentage?: number;
          allowed_organizations?: string[];
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role_id: string | null;
          is_active: boolean;
          invited_by: string | null;
          invited_at: string | null;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role_id?: string | null;
          is_active?: boolean;
          invited_by?: string | null;
          invited_at?: string | null;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role_id?: string | null;
          is_active?: boolean;
          invited_by?: string | null;
          invited_at?: string | null;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memberships_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
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
      inventory_batches: {
        Row: {
          batch_number: string;
          created_at: string;
          current_qty: number;
          entry_cost: number;
          entry_date: string;
          expiry_date: string | null;
          id: string;
          initial_qty: number;
          product_id: string;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          batch_number: string;
          created_at?: string;
          current_qty: number;
          entry_cost?: number;
          entry_date?: string;
          expiry_date?: string | null;
          id?: string;
          initial_qty: number;
          product_id: string;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          batch_number?: string;
          created_at?: string;
          current_qty?: number;
          entry_cost?: number;
          entry_date?: string;
          expiry_date?: string | null;
          id?: string;
          initial_qty?: number;
          product_id?: string;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_batches_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_batches_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      inventory_movements: {
        Row: {
          batch_id: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          product_id: string;
          quantity: number;
          reason: string | null;
          reference_id: string | null;
          store_id: string;
          type: Database["public"]["Enums"]["inventory_movement_type"];
        };
        Insert: {
          batch_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          product_id: string;
          quantity: number;
          reason?: string | null;
          reference_id?: string | null;
          store_id: string;
          type: Database["public"]["Enums"]["inventory_movement_type"];
        };
        Update: {
          batch_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          product_id?: string;
          quantity?: number;
          reason?: string | null;
          reference_id?: string | null;
          store_id?: string;
          type?: Database["public"]["Enums"]["inventory_movement_type"];
        };
        Relationships: [
          {
            foreignKeyName: "inventory_movements_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "inventory_batches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_movements_store_id_fkey";
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
          endpoint: string;
          keys: Json;
          store_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          endpoint: string;
          keys: Json;
          store_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          endpoint?: string;
          keys?: Json;
          store_id?: string;
          updated_at?: string;
          user_id?: string;
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
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          owner_id: string;
          settings: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          owner_id: string;
          settings?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          owner_id?: string;
          settings?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          resource: string;
          action: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          resource: string;
          action: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          resource?: string;
          action?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      plan_features: {
        Row: {
          id: string;
          plan_id: string;
          feature_key: string;
          feature_value: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          feature_key: string;
          feature_value?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          feature_key?: string;
          feature_value?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plan_features_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "subscription_plans";
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
          source: string;
          seller_id: string | null;
          fiscal_status: string;
          fiscal_key: string | null;
          fiscal_number: number | null;
          fiscal_serie: number | null;
          fiscal_xml_url: string | null;
          fiscal_pdf_url: string | null;
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
          source?: string;
          seller_id?: string | null;
          fiscal_status?: string;
          fiscal_key?: string | null;
          fiscal_number?: number | null;
          fiscal_serie?: number | null;
          fiscal_xml_url?: string | null;
          fiscal_pdf_url?: string | null;
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
          source?: string;
          seller_id?: string | null;
          fiscal_status?: string;
          fiscal_key?: string | null;
          fiscal_number?: number | null;
          fiscal_serie?: number | null;
          fiscal_xml_url?: string | null;
          fiscal_pdf_url?: string | null;
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
          ai_specs: Json | null;
          ai_description: string | null;
          ai_tags: string[] | null;
          ai_analyzed_at: string | null;
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
          ai_specs?: Json | null;
          ai_description?: string | null;
          ai_tags?: string[] | null;
          ai_analyzed_at?: string | null;
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
          ai_specs?: Json | null;
          ai_description?: string | null;
          ai_tags?: string[] | null;
          ai_analyzed_at?: string | null;
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
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
        ];
      };
      roles: {
        Row: {
          id: string;
          organization_id: string | null;
          name: string;
          description: string | null;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          name: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          name?: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
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
      service_orders: {
        Row: {
          created_at: string;
          customer_id: string;
          expected_at: string | null;
          external_os_number: string | null;
          finished_at: string | null;
          id: string;
          lab_name: string | null;
          notes: string | null;
          order_id: string;
          prescription_id: string | null;
          status: string;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          customer_id: string;
          expected_at?: string | null;
          external_os_number?: string | null;
          finished_at?: string | null;
          id?: string;
          lab_name?: string | null;
          notes?: string | null;
          order_id: string;
          prescription_id?: string | null;
          status?: string;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          customer_id?: string;
          expected_at?: string | null;
          external_os_number?: string | null;
          finished_at?: string | null;
          id?: string;
          lab_name?: string | null;
          notes?: string | null;
          order_id?: string;
          prescription_id?: string | null;
          status?: string;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_orders_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_orders_prescription_id_fkey";
            columns: ["prescription_id"];
            isOneToOne: false;
            referencedRelation: "prescriptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_orders_store_id_fkey";
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
          cnpj: string | null;
          ie: string | null;
          tax_regime: string | null;
          fiscal_settings: Json;
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
          cnpj?: string | null;
          ie?: string | null;
          tax_regime?: string | null;
          fiscal_settings?: Json;
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
          cnpj?: string | null;
          ie?: string | null;
          tax_regime?: string | null;
          fiscal_settings?: Json;
        };
        Relationships: [];
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price_monthly: number;
          price_yearly: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price_monthly?: number;
          price_yearly?: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price_monthly?: number;
          price_yearly?: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tenant_subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          plan_id: string;
          status: string;
          billing_cycle: string;
          current_period_start: string;
          current_period_end: string;
          trial_end: string | null;
          cancel_at: string | null;
          cancelled_at: string | null;
          payment_provider: string | null;
          payment_provider_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          plan_id: string;
          status?: string;
          billing_cycle?: string;
          current_period_start?: string;
          current_period_end: string;
          trial_end?: string | null;
          cancel_at?: string | null;
          cancelled_at?: string | null;
          payment_provider?: string | null;
          payment_provider_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          plan_id?: string;
          status?: string;
          billing_cycle?: string;
          current_period_start?: string;
          current_period_end?: string;
          trial_end?: string | null;
          cancel_at?: string | null;
          cancelled_at?: string | null;
          payment_provider?: string | null;
          payment_provider_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_subscriptions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenant_subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "subscription_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      usage_tracking: {
        Row: {
          id: string;
          organization_id: string;
          metric_key: string;
          metric_value: number;
          period_start: string;
          period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          metric_key: string;
          metric_value?: number;
          period_start: string;
          period_end: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          metric_key?: string;
          metric_value?: number;
          period_start?: string;
          period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_tracking_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
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
      inventory_abc_analysis: {
        Row: {
          abc_class: string | null;
          brand: string | null;
          category: string | null;
          cumulative_percentage: number | null;
          cumulative_revenue: number | null;
          name: string | null;
          product_id: string | null;
          store_id: string | null;
          total_revenue: number | null;
          total_store_revenue: number | null;
          total_units_sold: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_batches_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_batches_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      increment_batch_qty: {
        Args: {
          p_batch_id: string;
          p_increment: number;
        };
        Returns: undefined;
      };
      process_inventory_sale: {
        Args: {
          p_store_id: string;
          p_product_id: string;
          p_quantity: number;
          p_reference_id: string;
          p_user_id: string;
          p_reason?: string;
        };
        Returns: boolean;
      };
      get_user_by_email: {
        Args: { p_email: string };
        Returns: { id: string } | null;
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
      user_organization_ids: {
        Args: never;
        Returns: {
          organization_id: string;
        }[];
      };
    };
    Enums: {
      inventory_movement_type:
        | "entry"
        | "sale"
        | "return"
        | "adjustment"
        | "transfer"
        | "loss";
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
