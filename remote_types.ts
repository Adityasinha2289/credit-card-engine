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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      affiliate_relationships: {
        Row: {
          commission_model: string
          commission_terms: Json
          created_at: string
          id: string
          network: string
          partner_id: string
          status: string | null
          tracking_template_url: string
          updated_at: string
        }
        Insert: {
          commission_model: string
          commission_terms?: Json
          created_at?: string
          id?: string
          network: string
          partner_id: string
          status?: string | null
          tracking_template_url: string
          updated_at?: string
        }
        Update: {
          commission_model?: string
          commission_terms?: Json
          created_at?: string
          id?: string
          network?: string
          partner_id?: string
          status?: string | null
          tracking_template_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_relationships_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      apply_clicks: {
        Row: {
          card_id: string
          clicked_at: string | null
          id: number
          user_id: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          card_id: string
          clicked_at?: string | null
          id?: number
          user_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          card_id?: string
          clicked_at?: string | null
          id?: number
          user_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apply_clicks_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apply_clicks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          category: string
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          limit_amount: number
          user_id: string
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          limit_amount: number
          user_id: string
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          limit_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          annual_fee: number | null
          apply_url: string | null
          bank: string
          base_reward_rate: number | null
          created_at: string | null
          fee_waiver_spend: number | null
          gradient_from: string | null
          gradient_to: string | null
          highlights: Json | null
          id: string
          is_active: boolean | null
          lounge_access: number | null
          min_cibil: number | null
          min_income: number | null
          name: string
          network: string
          rewards: Json | null
          welcome_bonus: string | null
        }
        Insert: {
          annual_fee?: number | null
          apply_url?: string | null
          bank: string
          base_reward_rate?: number | null
          created_at?: string | null
          fee_waiver_spend?: number | null
          gradient_from?: string | null
          gradient_to?: string | null
          highlights?: Json | null
          id: string
          is_active?: boolean | null
          lounge_access?: number | null
          min_cibil?: number | null
          min_income?: number | null
          name: string
          network: string
          rewards?: Json | null
          welcome_bonus?: string | null
        }
        Update: {
          annual_fee?: number | null
          apply_url?: string | null
          bank?: string
          base_reward_rate?: number | null
          created_at?: string | null
          fee_waiver_spend?: number | null
          gradient_from?: string | null
          gradient_to?: string | null
          highlights?: Json | null
          id?: string
          is_active?: boolean | null
          lounge_access?: number | null
          min_cibil?: number | null
          min_income?: number | null
          name?: string
          network?: string
          rewards?: Json | null
          welcome_bonus?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_entities: {
        Row: {
          base_price: number
          category_id: string | null
          created_at: string
          currency: string | null
          description: string | null
          destination_path: string
          entity_type: string
          id: string
          image_url: string | null
          is_sponsored: boolean | null
          last_verified_at: string
          name: string
          partner_id: string
          sku: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          base_price: number
          category_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          destination_path: string
          entity_type: string
          id?: string
          image_url?: string | null
          is_sponsored?: boolean | null
          last_verified_at?: string
          name: string
          partner_id: string
          sku?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          category_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          destination_path?: string
          entity_type?: string
          id?: string
          image_url?: string | null
          is_sponsored?: boolean | null
          last_verified_at?: string
          name?: string
          partner_id?: string
          sku?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_entities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_entities_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          actual_commission: number | null
          conversion_id: string
          created_at: string
          expected_commission: number
          id: string
          paid_at: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          actual_commission?: number | null
          conversion_id: string
          created_at?: string
          expected_commission: number
          id?: string
          paid_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          actual_commission?: number | null
          conversion_id?: string
          created_at?: string
          expected_commission?: number
          id?: string
          paid_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_conversion_id_fkey"
            columns: ["conversion_id"]
            isOneToOne: false
            referencedRelation: "conversions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversions: {
        Row: {
          converted_at: string
          created_at: string
          currency: string | null
          external_transaction_id: string
          id: string
          order_value: number
          partner_id: string
          status: string | null
          tracking_event_id: string
          updated_at: string
        }
        Insert: {
          converted_at: string
          created_at?: string
          currency?: string | null
          external_transaction_id: string
          id?: string
          order_value: number
          partner_id: string
          status?: string | null
          tracking_event_id: string
          updated_at?: string
        }
        Update: {
          converted_at?: string
          created_at?: string
          currency?: string | null
          external_transaction_id?: string
          id?: string
          order_value?: number
          partner_id?: string
          status?: string | null
          tracking_event_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversions_tracking_event_id_fkey"
            columns: ["tracking_event_id"]
            isOneToOne: false
            referencedRelation: "tracking_events"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_accounts: {
        Row: {
          available_credit: number | null
          card_id: string
          created_at: string | null
          current_balance: number | null
          due_date: string | null
          id: string
          min_due: number | null
          next_statement_date: string | null
          updated_at: string | null
          user_card_id: string
          user_id: string
        }
        Insert: {
          available_credit?: number | null
          card_id: string
          created_at?: string | null
          current_balance?: number | null
          due_date?: string | null
          id?: string
          min_due?: number | null
          next_statement_date?: string | null
          updated_at?: string | null
          user_card_id: string
          user_id: string
        }
        Update: {
          available_credit?: number | null
          card_id?: string
          created_at?: string | null
          current_balance?: number | null
          due_date?: string | null
          id?: string
          min_due?: number | null
          next_statement_date?: string | null
          updated_at?: string | null
          user_card_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_accounts_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_accounts_user_card_id_fkey"
            columns: ["user_card_id"]
            isOneToOne: true
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          category: string
          keyword: string
        }
        Insert: {
          category: string
          keyword: string
        }
        Update: {
          category?: string
          keyword?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string
          description: string
          eligibility_rules: Json
          id: string
          internal_campaign_metadata: Json | null
          max_discount: number | null
          min_spend: number | null
          offer_type: string
          source: string
          status: string | null
          title: string
          updated_at: string
          valid_from: string
          valid_until: string
          value: number
        }
        Insert: {
          created_at?: string
          description: string
          eligibility_rules?: Json
          id?: string
          internal_campaign_metadata?: Json | null
          max_discount?: number | null
          min_spend?: number | null
          offer_type: string
          source: string
          status?: string | null
          title: string
          updated_at?: string
          valid_from?: string
          valid_until: string
          value: number
        }
        Update: {
          created_at?: string
          description?: string
          eligibility_rules?: Json
          id?: string
          internal_campaign_metadata?: Json | null
          max_discount?: number | null
          min_spend?: number | null
          offer_type?: string
          source?: string
          status?: string | null
          title?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string
          value?: number
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_sponsored: boolean | null
          logo_url: string | null
          name: string
          primary_category_id: string | null
          slug: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_sponsored?: boolean | null
          logo_url?: string | null
          name: string
          primary_category_id?: string | null
          slug: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_sponsored?: boolean | null
          logo_url?: string | null
          name?: string
          primary_category_id?: string | null
          slug?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partners_primary_category_id_fkey"
            columns: ["primary_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          name: string
          provider: string
          status: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          provider: string
          status?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          provider?: string
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      score_history: {
        Row: {
          id: number
          recorded_at: string | null
          score: number
          user_id: string
        }
        Insert: {
          id?: number
          recorded_at?: string | null
          score: number
          user_id: string
        }
        Update: {
          id?: number
          recorded_at?: string | null
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle: string
          card_id: string
          category: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          next_billing_date: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle: string
          card_id: string
          category?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          next_billing_date: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          card_id?: string
          category?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          next_billing_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          commerce_entity_id: string | null
          created_at: string
          id: string
          offer_id: string | null
          partner_id: string
          recommendation_snapshot: Json
          source_placement: string
          user_id: string
        }
        Insert: {
          commerce_entity_id?: string | null
          created_at?: string
          id?: string
          offer_id?: string | null
          partner_id: string
          recommendation_snapshot: Json
          source_placement: string
          user_id: string
        }
        Update: {
          commerce_entity_id?: string | null
          created_at?: string
          id?: string
          offer_id?: string | null
          partner_id?: string
          recommendation_snapshot?: Json
          source_placement?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_commerce_entity_id_fkey"
            columns: ["commerce_entity_id"]
            isOneToOne: false
            referencedRelation: "commerce_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_events_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_events_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "public_offers_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          card_id: string | null
          category: string
          created_at: string | null
          id: string
          is_pending: boolean | null
          merchant: string
          type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          card_id?: string | null
          category: string
          created_at?: string | null
          id?: string
          is_pending?: boolean | null
          merchant: string
          type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          card_id?: string | null
          category?: string
          created_at?: string | null
          id?: string
          is_pending?: boolean | null
          merchant?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cards: {
        Row: {
          added_at: string | null
          card_id: string
          cardholder_name: string | null
          credit_limit: number | null
          expiry: string | null
          id: string
          last_4_digits: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          added_at?: string | null
          card_id: string
          cardholder_name?: string | null
          credit_limit?: number | null
          expiry?: string | null
          id?: string
          last_4_digits?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          added_at?: string | null
          card_id?: string
          cardholder_name?: string | null
          credit_limit?: number | null
          expiry?: string | null
          id?: string
          last_4_digits?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          credit_score: number | null
          email: string
          id: string
          name: string | null
          phone: string | null
          redeemed_reward_points: number | null
          salary: number | null
          total_reward_points: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          credit_score?: number | null
          email: string
          id: string
          name?: string | null
          phone?: string | null
          redeemed_reward_points?: number | null
          salary?: number | null
          total_reward_points?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          credit_score?: number | null
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          redeemed_reward_points?: number | null
          salary?: number | null
          total_reward_points?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_offers_view: {
        Row: {
          created_at: string | null
          description: string | null
          eligibility_rules: Json | null
          id: string | null
          max_discount: number | null
          min_spend: number | null
          offer_type: string | null
          source: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
          value: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          eligibility_rules?: Json | null
          id?: string | null
          max_discount?: number | null
          min_spend?: number | null
          offer_type?: string | null
          source?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          eligibility_rules?: Json | null
          id?: string | null
          max_discount?: number | null
          min_spend?: number | null
          offer_type?: string | null
          source?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          value?: number | null
        }
        Relationships: []
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
