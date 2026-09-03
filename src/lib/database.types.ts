/**
 * Auto-generated Supabase Database Types
 * 
 * These types mirror the PostgreSQL schema defined in:
 *   supabase/migrations/001_initial_schema.sql
 * 
 * Regenerate with: npx supabase gen types typescript --local > src/lib/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          avatar_url: string | null;
          salary: number;
          credit_score: number;
          total_reward_points: number;
          redeemed_reward_points: number;
          onboarding_completed: boolean;
          user_segment: string | null;
          primary_goal: string | null;
          spend_categories: Json;
          city: string | null;
          occupation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          salary?: number;
          credit_score?: number;
          total_reward_points?: number;
          redeemed_reward_points?: number;
          onboarding_completed?: boolean;
          user_segment?: string | null;
          primary_goal?: string | null;
          spend_categories?: Json;
          city?: string | null;
          occupation?: string | null;
        };
        Update: {
          name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          salary?: number;
          credit_score?: number;
          total_reward_points?: number;
          redeemed_reward_points?: number;
          onboarding_completed?: boolean;
          user_segment?: string | null;
          primary_goal?: string | null;
          spend_categories?: Json;
          city?: string | null;
          occupation?: string | null;
        };
      };

      cards: {
        Row: {
          id: string;
          name: string;
          bank: string;
          network: string;
          annual_fee: number;
          fee_waiver_spend: number | null;
          min_income: number;
          min_cibil: number;
          welcome_bonus: string | null;
          lounge_access: number;
          base_reward_rate: number;
          rewards: Json;
          highlights: Json;
          gradient_from: string | null;
          gradient_to: string | null;
          apply_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          bank: string;
          network: string;
          annual_fee?: number;
          fee_waiver_spend?: number | null;
          min_income?: number;
          min_cibil?: number;
          welcome_bonus?: string | null;
          lounge_access?: number;
          base_reward_rate?: number;
          rewards?: Json;
          highlights?: Json;
          gradient_from?: string | null;
          gradient_to?: string | null;
          apply_url?: string | null;
        };
        Update: Partial<Database['public']['Tables']['cards']['Insert']>;
      };

      user_cards: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          last_4_digits: string | null;
          cardholder_name: string | null;
          expiry: string | null;
          credit_limit: number;
          status: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id: string;
          last_4_digits?: string | null;
          cardholder_name?: string | null;
          expiry?: string | null;
          credit_limit?: number;
          status?: string;
        };
        Update: Partial<Database['public']['Tables']['user_cards']['Insert']>;
      };

      transactions: {
        Row: {
          id: string;
          user_id: string;
          card_id: string | null;
          merchant: string;
          amount: number;
          category: string;
          type: string;
          is_pending: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id?: string | null;
          merchant: string;
          amount: number;
          category: string;
          type?: string;
          is_pending?: boolean;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };

      apply_clicks: {
        Row: {
          id: number;
          user_id: string | null;
          card_id: string;
          utm_source: string | null;
          utm_medium: string | null;
          clicked_at: string;
        };
        Insert: {
          user_id?: string | null;
          card_id: string;
          utm_source?: string | null;
          utm_medium?: string | null;
        };
        Update: Partial<Database['public']['Tables']['apply_clicks']['Insert']>;
      };

      score_history: {
        Row: {
          id: number;
          user_id: string;
          score: number;
          recorded_at: string;
        };
        Insert: {
          user_id: string;
          score: number;
        };
        Update: Partial<Database['public']['Tables']['score_history']['Insert']>;
      };

      notifications: {
        Row: {
          id: number;
          user_id: string;
          type: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: string;
          title: string;
          message: string;
        };
        Update: {
          is_read?: boolean;
        };
      };

      credit_accounts: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          user_card_id: string;
          current_balance: number;
          available_credit: number;
          next_statement_date: string | null;
          due_date: string | null;
          min_due: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id: string;
          user_card_id: string;
          current_balance?: number;
          available_credit?: number;
          next_statement_date?: string | null;
          due_date?: string | null;
          min_due?: number;
        };
        Update: Partial<Database['public']['Tables']['credit_accounts']['Insert']>;
      };

      budgets: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          limit_amount: number;
          icon: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          limit_amount: number;
          icon?: string | null;
          color?: string | null;
        };
        Update: Partial<Database['public']['Tables']['budgets']['Insert']>;
      };

      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          name: string;
          amount: number;
          billing_cycle: string;
          next_billing_date: string;
          icon: string | null;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id: string;
          name: string;
          amount: number;
          billing_cycle: string;
          next_billing_date: string;
          icon?: string | null;
          category?: string;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          parent_id: string | null;
          icon: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['categories']['Row']>;
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      partners: {
        Row: {
          id: string;
          slug: string;
          name: string;
          logo_url: string | null;
          description: string | null;
          primary_category_id: string | null;
          is_sponsored: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['partners']['Row']>;
        Update: Partial<Database['public']['Tables']['partners']['Row']>;
      };
      commerce_entities: {
        Row: {
          id: string;
          partner_id: string;
          category_id: string | null;
          entity_type: string;
          name: string;
          description: string | null;
          sku: string | null;
          image_url: string | null;
          base_price: number;
          currency: string;
          destination_path: string;
          is_sponsored: boolean;
          status: string;
          created_at: string;
          updated_at: string;
          last_verified_at: string;
        };
        Insert: Partial<Database['public']['Tables']['commerce_entities']['Row']>;
        Update: Partial<Database['public']['Tables']['commerce_entities']['Row']>;
      };
      offers: {
        Row: {
          id: string;
          source: string;
          offer_type: string;
          value: number;
          title: string;
          description: string;
          min_spend: number;
          max_discount: number | null;
          valid_from: string;
          valid_until: string;
          status: string;
          eligibility_rules: Json;
          internal_campaign_metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['offers']['Row']>;
        Update: Partial<Database['public']['Tables']['offers']['Row']>;
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          name: string;
          provider: string;
          metadata: Json;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['payment_methods']['Row']>;
        Update: Partial<Database['public']['Tables']['payment_methods']['Row']>;
      };
      affiliate_relationships: {
        Row: {
          id: string;
          partner_id: string;
          network: string;
          tracking_template_url: string;
          commission_model: string;
          commission_terms: Json;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['affiliate_relationships']['Row']>;
        Update: Partial<Database['public']['Tables']['affiliate_relationships']['Row']>;
      };
      tracking_events: {
        Row: {
          id: string;
          user_id: string;
          commerce_entity_id: string | null;
          partner_id: string;
          offer_id: string | null;
          source_placement: string;
          recommendation_snapshot: Json;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['tracking_events']['Row']>;
        Update: Partial<Database['public']['Tables']['tracking_events']['Row']>;
      };
      conversions: {
        Row: {
          id: string;
          tracking_event_id: string;
          partner_id: string;
          external_transaction_id: string;
          order_value: number;
          currency: string;
          status: string;
          converted_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['conversions']['Row']>;
        Update: Partial<Database['public']['Tables']['conversions']['Row']>;
      };
      commissions: {
        Row: {
          id: string;
          conversion_id: string;
          expected_commission: number;
          actual_commission: number | null;
          status: string;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['commissions']['Row']>;
        Update: Partial<Database['public']['Tables']['commissions']['Row']>;
      };
      marketplace_partner_mappings: {
        Row: {
          id: string;
          partner_id: string;
          internal_name: string;
          webhook_secret: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['marketplace_partner_mappings']['Row']>;
        Update: Partial<Database['public']['Tables']['marketplace_partner_mappings']['Row']>;
      };
      processed_webhook_events: {
        Row: {
          id: string;
          event_id: string;
          event_type: string;
          processed_at: string;
          status: string;
        };
        Insert: Partial<Database['public']['Tables']['processed_webhook_events']['Row']>;
        Update: Partial<Database['public']['Tables']['processed_webhook_events']['Row']>;
      };
    };
  };
}
