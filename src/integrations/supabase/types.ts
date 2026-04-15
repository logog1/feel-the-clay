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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounting_entries: {
        Row: {
          amount: number
          attachment_url: string | null
          category: string
          created_at: string
          date: string
          description: string
          expense_type: string | null
          id: string
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          attachment_url?: string | null
          category?: string
          created_at?: string
          date?: string
          description: string
          expense_type?: string | null
          id?: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          category?: string
          created_at?: string
          date?: string
          description?: string
          expense_type?: string | null
          id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      automations: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          name: string
          trigger_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          trigger_type?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          trigger_type?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          category: string
          content_ar: string
          content_en: string
          content_es: string
          content_fr: string
          cover_image: string
          created_at: string
          excerpt_ar: string
          excerpt_en: string
          excerpt_es: string
          excerpt_fr: string
          id: string
          is_published: boolean
          published_at: string
          read_time: number
          slug: string
          title_ar: string
          title_en: string
          title_es: string
          title_fr: string
          updated_at: string
        }
        Insert: {
          category?: string
          content_ar?: string
          content_en?: string
          content_es?: string
          content_fr?: string
          cover_image?: string
          created_at?: string
          excerpt_ar?: string
          excerpt_en?: string
          excerpt_es?: string
          excerpt_fr?: string
          id?: string
          is_published?: boolean
          published_at?: string
          read_time?: number
          slug: string
          title_ar?: string
          title_en?: string
          title_es?: string
          title_fr?: string
          updated_at?: string
        }
        Update: {
          category?: string
          content_ar?: string
          content_en?: string
          content_es?: string
          content_fr?: string
          cover_image?: string
          created_at?: string
          excerpt_ar?: string
          excerpt_en?: string
          excerpt_es?: string
          excerpt_fr?: string
          id?: string
          is_published?: boolean
          published_at?: string
          read_time?: number
          slug?: string
          title_ar?: string
          title_en?: string
          title_es?: string
          title_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          participants: number | null
          phone: string | null
          session_info: string | null
          status: string
          workshop: string
        }
        Insert: {
          booking_date?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          participants?: number | null
          phone?: string | null
          session_info?: string | null
          status?: string
          workshop: string
        }
        Update: {
          booking_date?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          participants?: number | null
          phone?: string | null
          session_info?: string | null
          status?: string
          workshop?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          from_website: boolean
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string
          total_bookings: number
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          from_website?: boolean
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string
          total_bookings?: number
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          from_website?: boolean
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string
          total_bookings?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      google_reviews: {
        Row: {
          author_name: string
          fetched_at: string
          id: string
          profile_photo_url: string | null
          rating: number
          relative_time_description: string | null
          text: string
        }
        Insert: {
          author_name: string
          fetched_at?: string
          id?: string
          profile_photo_url?: string | null
          rating?: number
          relative_time_description?: string | null
          text?: string
        }
        Update: {
          author_name?: string
          fetched_at?: string
          id?: string
          profile_photo_url?: string | null
          rating?: number
          relative_time_description?: string | null
          text?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string
          id: string
          linked_workshop: string | null
          min_quantity: number
          name: string
          notes: string | null
          quantity: number
          status: string
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          linked_workshop?: string | null
          min_quantity?: number
          name: string
          notes?: string | null
          quantity?: number
          status?: string
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          linked_workshop?: string | null
          min_quantity?: number
          name?: string
          notes?: string | null
          quantity?: number
          status?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_items: {
        Row: {
          assignee: string | null
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          platform: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          platform?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          platform?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_name: string
          customer_phone: string | null
          delivery_fee: number | null
          grand_total: number | null
          id: string
          items: Json
          region: string | null
          status: string
          subtotal: number | null
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_name: string
          customer_phone?: string | null
          delivery_fee?: number | null
          grand_total?: number | null
          id?: string
          items?: Json
          region?: string | null
          status?: string
          subtotal?: number | null
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_fee?: number | null
          grand_total?: number | null
          id?: string
          items?: Json
          region?: string | null
          status?: string
          subtotal?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          dimensions: string | null
          id: string
          images: Json
          is_promotion: boolean
          is_sold_out: boolean
          name: string
          original_price: number | null
          price: number
          promotion_label: string | null
          stock: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          dimensions?: string | null
          id: string
          images?: Json
          is_promotion?: boolean
          is_sold_out?: boolean
          name: string
          original_price?: number | null
          price?: number
          promotion_label?: string | null
          stock?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          dimensions?: string | null
          id?: string
          images?: Json
          is_promotion?: boolean
          is_sold_out?: boolean
          name?: string
          original_price?: number | null
          price?: number
          promotion_label?: string | null
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      store_sections: {
        Row: {
          description_ar: string
          description_en: string
          description_es: string
          description_fr: string
          donation: boolean
          enabled: boolean
          id: string
          sort_order: number
          title_ar: string
          title_en: string
          title_es: string
          title_fr: string
          updated_at: string
        }
        Insert: {
          description_ar?: string
          description_en?: string
          description_es?: string
          description_fr?: string
          donation?: boolean
          enabled?: boolean
          id: string
          sort_order?: number
          title_ar?: string
          title_en: string
          title_es?: string
          title_fr?: string
          updated_at?: string
        }
        Update: {
          description_ar?: string
          description_en?: string
          description_es?: string
          description_fr?: string
          donation?: boolean
          enabled?: boolean
          id?: string
          sort_order?: number
          title_ar?: string
          title_en?: string
          title_es?: string
          title_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          profile_type: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_type?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_type?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workshop_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          is_available: boolean
          workshop: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_available?: boolean
          workshop?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean
          workshop?: string
        }
        Relationships: []
      }
      workshop_cities: {
        Row: {
          city_name: string
          created_at: string
          id: string
          is_active: boolean
          schedule: Json
          updated_at: string
          workshop: string
        }
        Insert: {
          city_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          schedule?: Json
          updated_at?: string
          workshop?: string
        }
        Update: {
          city_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          schedule?: Json
          updated_at?: string
          workshop?: string
        }
        Relationships: []
      }
      workshop_city_pricing: {
        Row: {
          city_id: string
          created_at: string
          currency: string
          id: string
          price: number
          session_type: string
          updated_at: string
        }
        Insert: {
          city_id: string
          created_at?: string
          currency?: string
          id?: string
          price?: number
          session_type?: string
          updated_at?: string
        }
        Update: {
          city_id?: string
          created_at?: string
          currency?: string
          id?: string
          price?: number
          session_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_city_pricing_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "workshop_cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_my_profile_type: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      list_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          last_sign_in_at: string
          profile_type: string
          role: string
          user_id: string
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      remove_user_role: {
        Args: { _target_user_id: string }
        Returns: undefined
      }
      set_user_profile_type: {
        Args: { _profile_type: string; _target_user_id: string }
        Returns: undefined
      }
      set_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
