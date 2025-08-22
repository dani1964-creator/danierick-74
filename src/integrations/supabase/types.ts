export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      broker_contact_access_log: {
        Row: {
          access_type: string
          accessed_at: string
          broker_id: string
          id: string
          user_agent: string | null
          user_ip: unknown | null
        }
        Insert: {
          access_type?: string
          accessed_at?: string
          broker_id: string
          id?: string
          user_agent?: string | null
          user_ip?: unknown | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          broker_id?: string
          id?: string
          user_agent?: string | null
          user_ip?: unknown | null
        }
        Relationships: []
      }
      brokers: {
        Row: {
          about_text: string | null
          about_us_content: string | null
          address: string | null
          background_image_url: string | null
          business_name: string
          cnpj: string | null
          contact_email: string | null
          created_at: string
          creci: string | null
          display_name: string | null
          domain_config: Json | null
          email: string
          footer_text: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_properties: number | null
          overlay_color: string | null
          overlay_opacity: string | null
          phone: string | null
          plan_type: string | null
          primary_color: string | null
          privacy_policy_content: string | null
          secondary_color: string | null
          sections_background_color_1: string | null
          sections_background_color_2: string | null
          sections_background_color_3: string | null
          sections_background_style: string | null
          terms_of_use_content: string | null
          tracking_scripts: Json | null
          updated_at: string
          user_id: string
          website_slug: string | null
          whatsapp_button_color: string | null
          whatsapp_button_text: string | null
          whatsapp_number: string | null
        }
        Insert: {
          about_text?: string | null
          about_us_content?: string | null
          address?: string | null
          background_image_url?: string | null
          business_name: string
          cnpj?: string | null
          contact_email?: string | null
          created_at?: string
          creci?: string | null
          display_name?: string | null
          domain_config?: Json | null
          email: string
          footer_text?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_properties?: number | null
          overlay_color?: string | null
          overlay_opacity?: string | null
          phone?: string | null
          plan_type?: string | null
          primary_color?: string | null
          privacy_policy_content?: string | null
          secondary_color?: string | null
          sections_background_color_1?: string | null
          sections_background_color_2?: string | null
          sections_background_color_3?: string | null
          sections_background_style?: string | null
          terms_of_use_content?: string | null
          tracking_scripts?: Json | null
          updated_at?: string
          user_id: string
          website_slug?: string | null
          whatsapp_button_color?: string | null
          whatsapp_button_text?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          about_text?: string | null
          about_us_content?: string | null
          address?: string | null
          background_image_url?: string | null
          business_name?: string
          cnpj?: string | null
          contact_email?: string | null
          created_at?: string
          creci?: string | null
          display_name?: string | null
          domain_config?: Json | null
          email?: string
          footer_text?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_properties?: number | null
          overlay_color?: string | null
          overlay_opacity?: string | null
          phone?: string | null
          plan_type?: string | null
          primary_color?: string | null
          privacy_policy_content?: string | null
          secondary_color?: string | null
          sections_background_color_1?: string | null
          sections_background_color_2?: string | null
          sections_background_color_3?: string | null
          sections_background_style?: string | null
          terms_of_use_content?: string | null
          tracking_scripts?: Json | null
          updated_at?: string
          user_id?: string
          website_slug?: string | null
          whatsapp_button_color?: string | null
          whatsapp_button_text?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      contact_access_logs: {
        Row: {
          access_type: string
          accessed_at: string
          broker_id: string
          id: string
          session_id: string | null
          user_agent: string | null
          user_ip: unknown | null
        }
        Insert: {
          access_type?: string
          accessed_at?: string
          broker_id: string
          id?: string
          session_id?: string | null
          user_agent?: string | null
          user_ip?: unknown | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          broker_id?: string
          id?: string
          session_id?: string | null
          user_agent?: string | null
          user_ip?: unknown | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          broker_id: string
          commission_value: number | null
          created_at: string
          deal_closed_at: string | null
          deal_value: number | null
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          property_id: string | null
          realtor_id: string | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          broker_id: string
          commission_value?: number | null
          created_at?: string
          deal_closed_at?: string | null
          deal_value?: number | null
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          property_id?: string | null
          realtor_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          broker_id?: string
          commission_value?: number | null
          created_at?: string
          deal_closed_at?: string | null
          deal_value?: number | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          property_id?: string | null
          realtor_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_realtor_id_fkey"
            columns: ["realtor_id"]
            isOneToOne: false
            referencedRelation: "realtors"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          area_m2: number | null
          bathrooms: number | null
          bedrooms: number | null
          broker_id: string
          city: string | null
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          main_image_url: string | null
          neighborhood: string | null
          parking_spaces: number | null
          price: number
          property_code: string | null
          property_type: string
          realtor_id: string | null
          slug: string
          status: string | null
          title: string
          transaction_type: string
          uf: string | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          address: string
          area_m2?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          broker_id: string
          city?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          main_image_url?: string | null
          neighborhood?: string | null
          parking_spaces?: number | null
          price: number
          property_code?: string | null
          property_type: string
          realtor_id?: string | null
          slug: string
          status?: string | null
          title: string
          transaction_type: string
          uf?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          address?: string
          area_m2?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          broker_id?: string
          city?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          main_image_url?: string | null
          neighborhood?: string | null
          parking_spaces?: number | null
          price?: number
          property_code?: string | null
          property_type?: string
          realtor_id?: string | null
          slug?: string
          status?: string | null
          title?: string
          transaction_type?: string
          uf?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_realtor_id_fkey"
            columns: ["realtor_id"]
            isOneToOne: false
            referencedRelation: "realtors"
            referencedColumns: ["id"]
          },
        ]
      }
      realtors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          broker_id: string
          commission_percentage: number | null
          created_at: string
          creci: string | null
          email: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
          whatsapp_button_text: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          broker_id: string
          commission_percentage?: number | null
          created_at?: string
          creci?: string | null
          email: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
          whatsapp_button_text?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          broker_id?: string
          commission_percentage?: number | null
          created_at?: string
          creci?: string | null
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
          whatsapp_button_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "realtors_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          created_at: string
          endpoint: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          broker_id: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          platform: string
          updated_at: string
          url: string
        }
        Insert: {
          broker_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          platform: string
          updated_at?: string
          url: string
        }
        Update: {
          broker_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          platform?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_lead_rate_limit: {
        Args: { client_ip?: unknown }
        Returns: boolean
      }
      generate_slug: {
        Args: { title: string }
        Returns: string
      }
      get_broker_contact_info_with_logging: {
        Args: {
          broker_website_slug: string
          user_agent?: string
          user_ip?: unknown
        }
        Returns: {
          access_allowed: boolean
          contact_email: string
          creci: string
          whatsapp_number: string
        }[]
      }
      get_broker_contact_secure: {
        Args: { broker_website_slug: string; requesting_user_id?: string }
        Returns: {
          access_granted: boolean
          access_reason: string
          contact_email: string
          creci: string
          whatsapp_number: string
        }[]
      }
      get_public_broker_branding: {
        Args: { broker_website_slug?: string }
        Returns: {
          about_text: string
          about_us_content: string
          address: string
          background_image_url: string
          business_name: string
          cnpj: string
          created_at: string
          display_name: string
          footer_text: string
          hero_subtitle: string
          hero_title: string
          id: string
          is_active: boolean
          logo_url: string
          overlay_color: string
          overlay_opacity: string
          primary_color: string
          privacy_policy_content: string
          secondary_color: string
          sections_background_color_1: string
          sections_background_color_2: string
          sections_background_color_3: string
          sections_background_style: string
          terms_of_use_content: string
          tracking_scripts: Json
          updated_at: string
          website_slug: string
          whatsapp_button_color: string
          whatsapp_button_text: string
        }[]
      }
      get_public_broker_branding_secure: {
        Args: { broker_website_slug?: string }
        Returns: {
          about_text: string
          about_us_content: string
          background_image_url: string
          business_name: string
          created_at: string
          display_name: string
          footer_text: string
          hero_subtitle: string
          hero_title: string
          id: string
          is_active: boolean
          logo_url: string
          overlay_color: string
          overlay_opacity: string
          primary_color: string
          privacy_policy_content: string
          secondary_color: string
          terms_of_use_content: string
          tracking_scripts: Json
          updated_at: string
          website_slug: string
          whatsapp_button_color: string
          whatsapp_button_text: string
          whatsapp_number: string
        }[]
      }
      get_public_broker_contact: {
        Args: { broker_website_slug: string }
        Returns: {
          contact_email: string
          creci: string
          whatsapp_number: string
        }[]
      }
      get_public_properties: {
        Args: { property_limit?: number; property_offset?: number }
        Returns: {
          address: string
          area_m2: number
          bathrooms: number
          bedrooms: number
          broker_business_name: string
          broker_display_name: string
          broker_website_slug: string
          city: string
          created_at: string
          description: string
          features: string[]
          id: string
          images: string[]
          is_featured: boolean
          main_image_url: string
          neighborhood: string
          parking_spaces: number
          price: number
          property_code: string
          property_type: string
          slug: string
          status: string
          title: string
          transaction_type: string
          uf: string
          updated_at: string
          views_count: number
        }[]
      }
      get_public_properties_with_realtor: {
        Args: { property_limit?: number; property_offset?: number }
        Returns: {
          address: string
          area_m2: number
          bathrooms: number
          bedrooms: number
          broker_business_name: string
          broker_display_name: string
          broker_website_slug: string
          city: string
          created_at: string
          description: string
          features: string[]
          id: string
          images: string[]
          is_featured: boolean
          main_image_url: string
          neighborhood: string
          parking_spaces: number
          price: number
          property_code: string
          property_type: string
          realtor_avatar_url: string
          realtor_bio: string
          realtor_creci: string
          realtor_name: string
          realtor_whatsapp_button_text: string
          slug: string
          status: string
          title: string
          transaction_type: string
          uf: string
          updated_at: string
          views_count: number
        }[]
      }
      is_broker_query_safe: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_contact_access: {
        Args: {
          p_access_type?: string
          p_broker_id: string
          p_user_agent?: string
          p_user_ip?: unknown
        }
        Returns: boolean
      }
      user_can_access_realtor: {
        Args: { realtor_id: string }
        Returns: boolean
      }
      user_owns_broker: {
        Args: { p_broker_slug: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
