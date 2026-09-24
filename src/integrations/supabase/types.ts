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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      carbon_credits: {
        Row: {
          co2_pending_g: number
          co2_saved_g: number
          created_at: string
          current_streak: number
          id: string
          last_scan_date: string | null
          longest_streak: number
          total_credits: number
          updated_at: string
          user_id: string
        }
        Insert: {
          co2_pending_g?: number
          co2_saved_g?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_scan_date?: string | null
          longest_streak?: number
          total_credits?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          co2_pending_g?: number
          co2_saved_g?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_scan_date?: string | null
          longest_streak?: number
          total_credits?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          last_interaction_at: string | null
          receiver_id: string
          receiver_last_shared: string | null
          requester_id: string
          requester_last_shared: string | null
          status: string
          streak_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_interaction_at?: string | null
          receiver_id: string
          receiver_last_shared?: string | null
          requester_id: string
          requester_last_shared?: string | null
          status?: string
          streak_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_interaction_at?: string | null
          receiver_id?: string
          receiver_last_shared?: string | null
          requester_id?: string
          requester_last_shared?: string | null
          status?: string
          streak_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          category: string
          contact_email: string | null
          contact_whatsapp: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_free: boolean | null
          location_city: string | null
          location_state: string | null
          price: number | null
          status: string | null
          title: string
          user_id: string
          views: number | null
          waste_type: string | null
        }
        Insert: {
          category: string
          contact_email?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_free?: boolean | null
          location_city?: string | null
          location_state?: string | null
          price?: number | null
          status?: string | null
          title: string
          user_id: string
          views?: number | null
          waste_type?: string | null
        }
        Update: {
          category?: string
          contact_email?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_free?: boolean | null
          location_city?: string | null
          location_state?: string | null
          price?: number | null
          status?: string | null
          title?: string
          user_id?: string
          views?: number | null
          waste_type?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          joined_at: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code?: string
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          avatar_url: string | null
          created_at: string
          display_name: string | null
          friend_code: string | null
          id: string
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          friend_code?: string | null
          id?: string
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          friend_code?: string | null
          id?: string
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_listings: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_history: {
        Row: {
          carbon_saved: number
          category: Database["public"]["Enums"]["waste_category"]
          created_at: string
          credits_earned: number
          disposal_method: string | null
          id: string
          image_hash: string | null
          image_url: string | null
          item_name: string
          material: string | null
          organization_id: string | null
          reduced_credits: boolean | null
          source: string | null
          user_id: string
        }
        Insert: {
          carbon_saved?: number
          category: Database["public"]["Enums"]["waste_category"]
          created_at?: string
          credits_earned?: number
          disposal_method?: string | null
          id?: string
          image_hash?: string | null
          image_url?: string | null
          item_name: string
          material?: string | null
          organization_id?: string | null
          reduced_credits?: boolean | null
          source?: string | null
          user_id: string
        }
        Update: {
          carbon_saved?: number
          category?: Database["public"]["Enums"]["waste_category"]
          created_at?: string
          credits_earned?: number
          disposal_method?: string | null
          id?: string
          image_hash?: string | null
          image_url?: string | null
          item_name?: string
          material?: string | null
          organization_id?: string | null
          reduced_credits?: boolean | null
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_shares: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          message: string | null
          scan_id: string
          seen: boolean
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          message?: string | null
          scan_id: string
          seen?: boolean
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string | null
          scan_id?: string
          seen?: boolean
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_shares_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scan_history"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_org: { Args: { _name: string }; Returns: string }
      get_org_invite_code: { Args: { _org_id: string }; Returns: string }
      get_org_leaderboard: {
        Args: { _org_id: string }
        Returns: {
          avatar_url: string
          co2_saved_g: number
          current_streak: number
          display_name: string
          last_scan_at: string
          scan_count: number
          total_credits: number
          total_xp: number
          user_id: string
        }[]
      }
      get_org_stats: {
        Args: { _org_id: string }
        Returns: {
          active_today: number
          member_count: number
          scans_this_week: number
          total_co2_saved_g: number
          total_scans: number
        }[]
      }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      join_org_by_code: { Args: { _invite_code: string }; Returns: string }
      remove_org_member: {
        Args: { _member_user_id: string; _org_id: string }
        Returns: undefined
      }
    }
    Enums: {
      account_type: "student" | "individual" | "company" | "school"
      org_role: "admin" | "member"
      waste_category:
        | "recyclable"
        | "compostable"
        | "hazardous"
        | "landfill"
        | "upcyclable"
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
      account_type: ["student", "individual", "company", "school"],
      org_role: ["admin", "member"],
      waste_category: [
        "recyclable",
        "compostable",
        "hazardous",
        "landfill",
        "upcyclable",
      ],
    },
  },
} as const
