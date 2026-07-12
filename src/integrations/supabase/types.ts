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
          seo_description_ar: string
          seo_description_en: string
          seo_description_es: string
          seo_description_fr: string
          seo_title_ar: string
          seo_title_en: string
          seo_title_es: string
          seo_title_fr: string
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
          seo_description_ar?: string
          seo_description_en?: string
          seo_description_es?: string
          seo_description_fr?: string
          seo_title_ar?: string
          seo_title_en?: string
          seo_title_es?: string
          seo_title_fr?: string
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
          seo_description_ar?: string
          seo_description_en?: string
          seo_description_es?: string
          seo_description_fr?: string
          seo_title_ar?: string
          seo_title_en?: string
          seo_title_es?: string
          seo_title_fr?: string
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
          cancellation_reason: string | null
          cancelled_at: string | null
          city: string | null
          commission_amount: number | null
          commission_rate: number | null
          commission_status: string | null
          completed_at: string | null
          created_at: string
          email: string | null
          gross_amount: number | null
          id: string
          name: string
          notes: string | null
          participants: number | null
          partner_id: string | null
          phone: string | null
          qr_variant_code: string | null
          qr_variant_scope: string | null
          room_number: string | null
          session_info: string | null
          source: string | null
          status: string
          workshop: string
        }
        Insert: {
          booking_date?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          city?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          commission_status?: string | null
          completed_at?: string | null
          created_at?: string
          email?: string | null
          gross_amount?: number | null
          id?: string
          name: string
          notes?: string | null
          participants?: number | null
          partner_id?: string | null
          phone?: string | null
          qr_variant_code?: string | null
          qr_variant_scope?: string | null
          room_number?: string | null
          session_info?: string | null
          source?: string | null
          status?: string
          workshop: string
        }
        Update: {
          booking_date?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          city?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          commission_status?: string | null
          completed_at?: string | null
          created_at?: string
          email?: string | null
          gross_amount?: number | null
          id?: string
          name?: string
          notes?: string | null
          participants?: number | null
          partner_id?: string | null
          phone?: string | null
          qr_variant_code?: string | null
          qr_variant_scope?: string | null
          room_number?: string | null
          session_info?: string | null
          source?: string | null
          status?: string
          workshop?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners_public"
            referencedColumns: ["id"]
          },
        ]
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
      feedback: {
        Row: {
          created_at: string
          effectiveness: string | null
          email: string | null
          expectations: string | null
          facilitators: string | null
          id: string
          length_appropriate: string | null
          liked_most: string | null
          materials: string | null
          name: string | null
          organization: string | null
          phone: string | null
          recommendation: string | null
          satisfaction: string | null
          source: string | null
          suggestions: string | null
          workshop: string | null
        }
        Insert: {
          created_at?: string
          effectiveness?: string | null
          email?: string | null
          expectations?: string | null
          facilitators?: string | null
          id?: string
          length_appropriate?: string | null
          liked_most?: string | null
          materials?: string | null
          name?: string | null
          organization?: string | null
          phone?: string | null
          recommendation?: string | null
          satisfaction?: string | null
          source?: string | null
          suggestions?: string | null
          workshop?: string | null
        }
        Update: {
          created_at?: string
          effectiveness?: string | null
          email?: string | null
          expectations?: string | null
          facilitators?: string | null
          id?: string
          length_appropriate?: string | null
          liked_most?: string | null
          materials?: string | null
          name?: string | null
          organization?: string | null
          phone?: string | null
          recommendation?: string | null
          satisfaction?: string | null
          source?: string | null
          suggestions?: string | null
          workshop?: string | null
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
      hotel_partners: {
        Row: {
          address: string | null
          booking_channel: string | null
          brand_color: string
          city: string | null
          commission_notes: string | null
          commission_rate: number | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          cover_image: string | null
          created_at: string
          experiences_config: Json
          id: string
          internal_notes: string | null
          intro_ar: string
          intro_en: string
          intro_es: string
          intro_fr: string
          is_active: boolean
          languages_spoken: string[] | null
          logo_url: string | null
          name: string
          partnership_started_on: string | null
          partnership_status: string
          perks: Json
          qr_codes_installed: number
          rooms_count: number | null
          slug: string
          sort_order: number
          stars: number | null
          terms_accepted_at: string | null
          terms_version: string | null
          type: string
          updated_at: string
          website_url: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          booking_channel?: string | null
          brand_color?: string
          city?: string | null
          commission_notes?: string | null
          commission_rate?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          cover_image?: string | null
          created_at?: string
          experiences_config?: Json
          id?: string
          internal_notes?: string | null
          intro_ar?: string
          intro_en?: string
          intro_es?: string
          intro_fr?: string
          is_active?: boolean
          languages_spoken?: string[] | null
          logo_url?: string | null
          name: string
          partnership_started_on?: string | null
          partnership_status?: string
          perks?: Json
          qr_codes_installed?: number
          rooms_count?: number | null
          slug: string
          sort_order?: number
          stars?: number | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          type?: string
          updated_at?: string
          website_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          booking_channel?: string | null
          brand_color?: string
          city?: string | null
          commission_notes?: string | null
          commission_rate?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          cover_image?: string | null
          created_at?: string
          experiences_config?: Json
          id?: string
          internal_notes?: string | null
          intro_ar?: string
          intro_en?: string
          intro_es?: string
          intro_fr?: string
          is_active?: boolean
          languages_spoken?: string[] | null
          logo_url?: string | null
          name?: string
          partnership_started_on?: string | null
          partnership_status?: string
          perks?: Json
          qr_codes_installed?: number
          rooms_count?: number | null
          slug?: string
          sort_order?: number
          stars?: number | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          type?: string
          updated_at?: string
          website_url?: string | null
          whatsapp?: string | null
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
      notification_log: {
        Row: {
          booking_id: string | null
          channel: string
          created_at: string
          error_message: string | null
          id: string
          idempotency_key: string | null
          payload: Json | null
          recipient: string
          status: string
        }
        Insert: {
          booking_id?: string | null
          channel: string
          created_at?: string
          error_message?: string | null
          id?: string
          idempotency_key?: string | null
          payload?: Json | null
          recipient: string
          status: string
        }
        Update: {
          booking_id?: string | null
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          idempotency_key?: string | null
          payload?: Json | null
          recipient?: string
          status?: string
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
      partner_kit_orders: {
        Row: {
          courier: string | null
          created_at: string
          delivered_at: string | null
          id: string
          kit_type: string
          notes: string | null
          partner_id: string
          quantity: number
          requested_by: string | null
          shipped_at: string | null
          status: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          courier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          kit_type?: string
          notes?: string | null
          partner_id: string
          quantity?: number
          requested_by?: string | null
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          courier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          kit_type?: string
          notes?: string | null
          partner_id?: string
          quantity?: number
          requested_by?: string | null
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_kit_orders_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_kit_orders_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_offer_assignments: {
        Row: {
          assigned_at: string
          cta_override_type: string | null
          cta_override_value: string | null
          id: string
          is_published: boolean
          offer_id: string
          partner_id: string
          sort_order: number
        }
        Insert: {
          assigned_at?: string
          cta_override_type?: string | null
          cta_override_value?: string | null
          id?: string
          is_published?: boolean
          offer_id: string
          partner_id: string
          sort_order?: number
        }
        Update: {
          assigned_at?: string
          cta_override_type?: string | null
          cta_override_value?: string | null
          id?: string
          is_published?: boolean
          offer_id?: string
          partner_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_offer_assignments_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "partner_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_offer_assignments_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "partner_offers_public"
            referencedColumns: ["offer_id"]
          },
          {
            foreignKeyName: "partner_offer_assignments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_offer_assignments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_offers: {
        Row: {
          capacity: number | null
          cover_image: string | null
          created_at: string
          cta_label: string | null
          cta_type: string
          cta_value: string | null
          currency: string
          description: string | null
          ends_at: string | null
          event_at: string | null
          id: string
          is_active: boolean
          kind: string
          price: number | null
          sort_order: number
          starts_at: string | null
          subtitle: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          cover_image?: string | null
          created_at?: string
          cta_label?: string | null
          cta_type?: string
          cta_value?: string | null
          currency?: string
          description?: string | null
          ends_at?: string | null
          event_at?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          price?: number | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          cover_image?: string | null
          created_at?: string
          cta_label?: string | null
          cta_type?: string
          cta_value?: string | null
          currency?: string
          description?: string | null
          ends_at?: string | null
          event_at?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          price?: number | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_payouts: {
        Row: {
          amount: number
          booking_ids: string[] | null
          created_at: string
          currency: string
          id: string
          method: string | null
          notes: string | null
          paid_at: string | null
          partner_id: string
          period_end: string
          period_start: string
          reference: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          booking_ids?: string[] | null
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          partner_id: string
          period_end: string
          period_start: string
          reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_ids?: string[] | null
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          partner_id?: string
          period_end?: string
          period_start?: string
          reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_qr_variants: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          label: string
          partner_id: string
          room_number: string | null
          scope: string
          staff_user_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          partner_id: string
          room_number?: string | null
          scope?: string
          staff_user_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          partner_id?: string
          room_number?: string | null
          scope?: string
          staff_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_qr_variants_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_qr_variants_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_staff: {
        Row: {
          created_at: string
          email: string | null
          id: string
          partner_id: string
          terms_accepted_at: string | null
          terms_accepted_ip: string | null
          terms_version: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          partner_id: string
          terms_accepted_at?: string | null
          terms_accepted_ip?: string | null
          terms_version?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          partner_id?: string
          terms_accepted_at?: string | null
          terms_accepted_ip?: string | null
          terms_version?: string | null
          user_id?: string
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
      qr_scan_log: {
        Row: {
          booking_id: string | null
          id: string
          ip_hash: string | null
          partner_id: string
          referrer: string | null
          scanned_at: string
          session_id: string | null
          user_agent: string | null
          variant_code: string | null
          variant_label: string | null
          variant_scope: string | null
        }
        Insert: {
          booking_id?: string | null
          id?: string
          ip_hash?: string | null
          partner_id: string
          referrer?: string | null
          scanned_at?: string
          session_id?: string | null
          user_agent?: string | null
          variant_code?: string | null
          variant_label?: string | null
          variant_scope?: string | null
        }
        Update: {
          booking_id?: string | null
          id?: string
          ip_hash?: string | null
          partner_id?: string
          referrer?: string | null
          scanned_at?: string
          session_id?: string | null
          user_agent?: string | null
          variant_code?: string | null
          variant_label?: string | null
          variant_scope?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scan_log_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_scan_log_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners_public"
            referencedColumns: ["id"]
          },
        ]
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
      sofitel_bookings: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          commission_amount: number | null
          commission_rate: number | null
          commission_status: string | null
          completed_at: string | null
          created_at: string
          currency: string | null
          experience_id: string
          gross_amount: number | null
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          notes: string | null
          participants: number
          partner_id: string | null
          price_per_person: number | null
          qr_variant_code: string | null
          qr_variant_scope: string | null
          room_number: string | null
          source: string
          status: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          commission_status?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          experience_id: string
          gross_amount?: number | null
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          participants?: number
          partner_id?: string | null
          price_per_person?: number | null
          qr_variant_code?: string | null
          qr_variant_scope?: string | null
          room_number?: string | null
          source?: string
          status?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          commission_status?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          experience_id?: string
          gross_amount?: number | null
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          participants?: number
          partner_id?: string | null
          price_per_person?: number | null
          qr_variant_code?: string | null
          qr_variant_scope?: string | null
          room_number?: string | null
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sofitel_bookings_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "sofitel_experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sofitel_bookings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sofitel_bookings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sofitel_experiences: {
        Row: {
          audience: string
          capacity: number
          category: string
          cover_image: string | null
          created_at: string
          currency: string
          description: string
          difficulty: string
          duration_minutes: number
          id: string
          is_active: boolean
          location: string | null
          partner_id: string | null
          price_per_person: number
          scheduled_at: string
          slug: string
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          capacity?: number
          category?: string
          cover_image?: string | null
          created_at?: string
          currency?: string
          description?: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          location?: string | null
          partner_id?: string | null
          price_per_person?: number
          scheduled_at: string
          slug: string
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          capacity?: number
          category?: string
          cover_image?: string | null
          created_at?: string
          currency?: string
          description?: string
          difficulty?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          location?: string | null
          partner_id?: string | null
          price_per_person?: number
          scheduled_at?: string
          slug?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sofitel_experiences_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sofitel_experiences_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sofitel_group_requests: {
        Row: {
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          experience_type: string | null
          group_size: number
          id: string
          notes: string | null
          partner_id: string | null
          preferred_date: string
          preferred_time: string | null
          room_number: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          experience_type?: string | null
          group_size?: number
          id?: string
          notes?: string | null
          partner_id?: string | null
          preferred_date: string
          preferred_time?: string | null
          room_number?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          experience_type?: string | null
          group_size?: number
          id?: string
          notes?: string | null
          partner_id?: string | null
          preferred_date?: string
          preferred_time?: string | null
          room_number?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sofitel_group_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sofitel_group_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners_public"
            referencedColumns: ["id"]
          },
        ]
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
      zellige_kit_items: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          key: string
          kind: string
          label: string | null
          meta: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          key: string
          kind: string
          label?: string | null
          meta?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          key?: string
          kind?: string
          label?: string | null
          meta?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      hotel_partners_public: {
        Row: {
          address: string | null
          brand_color: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          cover_image: string | null
          created_at: string | null
          experiences_config: Json | null
          id: string | null
          intro_ar: string | null
          intro_en: string | null
          intro_es: string | null
          intro_fr: string | null
          is_active: boolean | null
          languages_spoken: string[] | null
          logo_url: string | null
          name: string | null
          perks: Json | null
          slug: string | null
          sort_order: number | null
          stars: number | null
          type: string | null
          updated_at: string | null
          website_url: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          brand_color?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          cover_image?: string | null
          created_at?: string | null
          experiences_config?: Json | null
          id?: string | null
          intro_ar?: string | null
          intro_en?: string | null
          intro_es?: string | null
          intro_fr?: string | null
          is_active?: boolean | null
          languages_spoken?: string[] | null
          logo_url?: string | null
          name?: string | null
          perks?: Json | null
          slug?: string | null
          sort_order?: number | null
          stars?: number | null
          type?: string | null
          updated_at?: string | null
          website_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          brand_color?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          cover_image?: string | null
          created_at?: string | null
          experiences_config?: Json | null
          id?: string | null
          intro_ar?: string | null
          intro_en?: string | null
          intro_es?: string | null
          intro_fr?: string | null
          is_active?: boolean | null
          languages_spoken?: string[] | null
          logo_url?: string | null
          name?: string | null
          perks?: Json | null
          slug?: string | null
          sort_order?: number | null
          stars?: number | null
          type?: string | null
          updated_at?: string | null
          website_url?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      partner_offers_public: {
        Row: {
          assignment_id: string | null
          assignment_sort: number | null
          capacity: number | null
          cover_image: string | null
          cta_label: string | null
          cta_type: string | null
          cta_value: string | null
          currency: string | null
          description: string | null
          ends_at: string | null
          event_at: string | null
          kind: string | null
          offer_id: string | null
          partner_id: string | null
          price: number | null
          starts_at: string | null
          subtitle: string | null
          tags: string[] | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_offer_assignments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_offer_assignments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "hotel_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
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
      get_partner_commission_rate: {
        Args: { _partner_id: string }
        Returns: number
      }
      get_sofitel_availability: {
        Args: never
        Returns: {
          experience_id: string
          taken: number
        }[]
      }
      get_terraria_availability: {
        Args: { _days?: number }
        Returns: {
          bookings_count: number
          day: string
          is_blocked: boolean
          sofitel_sessions: number
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_partner_staff: {
        Args: { _partner_id: string; _user_id: string }
        Returns: boolean
      }
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
      app_role: "admin" | "user" | "hotel_staff"
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
      app_role: ["admin", "user", "hotel_staff"],
    },
  },
} as const
