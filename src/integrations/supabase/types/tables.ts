export interface DatabaseTables {
      chargers: {
        Row: {
          charger_code: string
          connector_type: string
          created_at: string
          id: string
          power_kw: number
          price_per_kwh: number
          reserved_by: string | null
          reserved_until: string | null
          station_id: string
          status: string
        }
        Insert: {
          charger_code: string
          connector_type?: string
          created_at?: string
          id?: string
          power_kw?: number
          price_per_kwh?: number
          reserved_by?: string | null
          reserved_until?: string | null
          station_id: string
          status?: string
        }
        Update: {
          charger_code?: string
          connector_type?: string
          created_at?: string
          id?: string
          power_kw?: number
          price_per_kwh?: number
          reserved_by?: string | null
          reserved_until?: string | null
          station_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "chargers_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "charging_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      charging_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          kwh: number
          station_name: string
          status: string
          upi_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kwh: number
          station_name: string
          status?: string
          upi_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kwh?: number
          station_name?: string
          status?: string
          upi_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      charging_sessions: {
        Row: {
          charger_code: string
          charger_id: string | null
          created_at: string
          duration_minutes: number
          end_battery: number | null
          end_time: string | null
          energy_consumed: number
          estimated_cost: number
          final_cost: number | null
          id: string
          power_kw: number
          price_per_kwh: number
          start_battery: number
          start_time: string
          station_id: string | null
          station_name: string
          status: string
          target_battery: number
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          charger_code?: string
          charger_id?: string | null
          created_at?: string
          duration_minutes?: number
          end_battery?: number | null
          end_time?: string | null
          energy_consumed?: number
          estimated_cost?: number
          final_cost?: number | null
          id?: string
          power_kw?: number
          price_per_kwh?: number
          start_battery?: number
          start_time?: string
          station_id?: string | null
          station_name?: string
          status?: string
          target_battery?: number
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          charger_code?: string
          charger_id?: string | null
          created_at?: string
          duration_minutes?: number
          end_battery?: number | null
          end_time?: string | null
          energy_consumed?: number
          estimated_cost?: number
          final_cost?: number | null
          id?: string
          power_kw?: number
          price_per_kwh?: number
          start_battery?: number
          start_time?: string
          station_id?: string | null
          station_name?: string
          status?: string
          target_battery?: number
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charging_sessions_charger_id_fkey"
            columns: ["charger_id"]
            isOneToOne: false
            referencedRelation: "chargers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charging_sessions_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "charging_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charging_sessions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      charging_stations: {
        Row: {
          address: string
          amenities: string[]
          created_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          operating_hours: string
          rating: number
        }
        Insert: {
          address?: string
          amenities?: string[]
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          operating_hours?: string
          rating?: number
        }
        Update: {
          address?: string
          amenities?: string[]
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          operating_hours?: string
          rating?: number
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          station_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          station_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          station_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "charging_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          energy_cost: number
          id: string
          payment_method: string
          payment_status: string
          platform_fee: number
          session_id: string | null
          taxes: number
          transaction_id: string
          upi_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          energy_cost?: number
          id?: string
          payment_method?: string
          payment_status?: string
          platform_fee?: number
          session_id?: string | null
          taxes?: number
          transaction_id: string
          upi_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          energy_cost?: number
          id?: string
          payment_method?: string
          payment_status?: string
          platform_fee?: number
          session_id?: string | null
          taxes?: number
          transaction_id?: string
          upi_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "charging_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          onboarded: boolean
          phone: string | null
          preferred_charge_limit: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string
          onboarded?: boolean
          phone?: string | null
          preferred_charge_limit?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          onboarded?: boolean
          phone?: string | null
          preferred_charge_limit?: number
        }
        Relationships: []
      }
      reservations: {
        Row: {
          charger_id: string
          created_at: string
          expires_at: string
          id: string
          station_id: string
          status: string
          user_id: string
        }
        Insert: {
          charger_id: string
          created_at?: string
          expires_at: string
          id?: string
          station_id: string
          status?: string
          user_id: string
        }
        Update: {
          charger_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          station_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_charger_id_fkey"
            columns: ["charger_id"]
            isOneToOne: false
            referencedRelation: "chargers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "charging_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      station_reviews: {
        Row: {
          author_name: string
          comment: string
          created_at: string
          id: string
          rating: number
          station_id: string
          user_id: string
        }
        Insert: {
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          station_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          station_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "station_reviews_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "charging_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          battery_capacity: number
          connector_type: string
          created_at: string
          current_battery: number
          id: string
          is_primary: boolean
          manufacturer: string
          model: string
          registration_number: string | null
          user_id: string
          year: number | null
        }
        Insert: {
          battery_capacity?: number
          connector_type?: string
          created_at?: string
          current_battery?: number
          id?: string
          is_primary?: boolean
          manufacturer?: string
          model: string
          registration_number?: string | null
          user_id: string
          year?: number | null
        }
        Update: {
          battery_capacity?: number
          connector_type?: string
          created_at?: string
          current_battery?: number
          id?: string
          is_primary?: boolean
          manufacturer?: string
          model?: string
          registration_number?: string | null
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }

}
