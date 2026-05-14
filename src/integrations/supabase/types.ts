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
  public: {
    Tables: {
      articles: {
        Row: {
          actif: boolean
          created_at: string
          id: string
          nom: string
          prix: number
          type_prix: Database["public"]["Enums"]["type_prix_enum"]
        }
        Insert: {
          actif?: boolean
          created_at?: string
          id?: string
          nom: string
          prix: number
          type_prix: Database["public"]["Enums"]["type_prix_enum"]
        }
        Update: {
          actif?: boolean
          created_at?: string
          id?: string
          nom?: string
          prix?: number
          type_prix?: Database["public"]["Enums"]["type_prix_enum"]
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          id: string
          nom: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          id?: string
          nom: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          id?: string
          nom?: string
          whatsapp?: string
        }
        Relationships: []
      }
      commandes: {
        Row: {
          client_id: string
          created_at: string
          date_depot: string
          date_recuperation_estimee: string | null
          date_recuperation_reelle: string | null
          id: string
          numero_ticket: string
          statut: Database["public"]["Enums"]["statut_commande_enum"]
          total_fcfa: number
        }
        Insert: {
          client_id: string
          created_at?: string
          date_depot?: string
          date_recuperation_estimee?: string | null
          date_recuperation_reelle?: string | null
          id?: string
          numero_ticket?: string
          statut?: Database["public"]["Enums"]["statut_commande_enum"]
          total_fcfa?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          date_depot?: string
          date_recuperation_estimee?: string | null
          date_recuperation_reelle?: string | null
          id?: string
          numero_ticket?: string
          statut?: Database["public"]["Enums"]["statut_commande_enum"]
          total_fcfa?: number
        }
        Relationships: [
          {
            foreignKeyName: "commandes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      lignes_commande: {
        Row: {
          article_id: string
          commande_id: string
          created_at: string
          id: string
          poids_kg: number | null
          quantite: number | null
          sous_total: number
        }
        Insert: {
          article_id: string
          commande_id: string
          created_at?: string
          id?: string
          poids_kg?: number | null
          quantite?: number | null
          sous_total: number
        }
        Update: {
          article_id?: string
          commande_id?: string
          created_at?: string
          id?: string
          poids_kg?: number | null
          quantite?: number | null
          sous_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "lignes_commande_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_commande_commande_id_fkey"
            columns: ["commande_id"]
            isOneToOne: false
            referencedRelation: "commandes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generer_numero_ticket: { Args: never; Returns: string }
    }
    Enums: {
      statut_commande_enum: "en_attente" | "en_cours" | "pret" | "recupere"
      type_prix_enum: "kilo" | "fixe"
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
      statut_commande_enum: ["en_attente", "en_cours", "pret", "recupere"],
      type_prix_enum: ["kilo", "fixe"],
    },
  },
} as const
