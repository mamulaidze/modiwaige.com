export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          closed_at: string | null;
          created_at: string;
          id: string;
          owner_id: string;
          post_id: string;
          requester_id: string;
          reservation_id: string;
          status: 'active' | 'closed';
          updated_at: string;
        };
        Insert: {
          closed_at?: string | null;
          created_at?: string;
          id?: string;
          owner_id: string;
          post_id: string;
          requester_id: string;
          reservation_id: string;
          status?: 'active' | 'closed';
          updated_at?: string;
        };
        Update: {
          closed_at?: string | null;
          created_at?: string;
          id?: string;
          owner_id?: string;
          post_id?: string;
          requester_id?: string;
          reservation_id?: string;
          status?: 'active' | 'closed';
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_requester_id_fkey';
            columns: ['requester_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_reservation_id_fkey';
            columns: ['reservation_id'];
            isOneToOne: true;
            referencedRelation: 'reservations';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          body: string;
          conversation_id: string;
          created_at: string;
          id: string;
          sender_id: string;
        };
        Insert: {
          body: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          sender_id: string;
        };
        Update: {
          body?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          expires_at: string | null;
          id: string;
          post_id: string | null;
          read_at: string | null;
          recipient_id: string;
          reservation_id: string | null;
          title: string;
          type:
            | 'reservation_requested'
            | 'reservation_accepted'
            | 'reservation_declined'
            | 'reservation_cancelled'
            | 'post_given'
            | 'post_boosted'
            | 'chat_message';
        };
        Insert: {
          body: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          post_id?: string | null;
          read_at?: string | null;
          recipient_id: string;
          reservation_id?: string | null;
          title: string;
          type:
            | 'reservation_requested'
            | 'reservation_accepted'
            | 'reservation_declined'
            | 'reservation_cancelled'
            | 'post_given'
            | 'post_boosted'
            | 'chat_message';
        };
        Update: {
          body?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          post_id?: string | null;
          read_at?: string | null;
          recipient_id?: string;
          reservation_id?: string | null;
          title?: string;
          type?:
            | 'reservation_requested'
            | 'reservation_accepted'
            | 'reservation_declined'
            | 'reservation_cancelled'
            | 'post_given'
            | 'post_boosted'
            | 'chat_message';
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_recipient_id_fkey';
            columns: ['recipient_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_reservation_id_fkey';
            columns: ['reservation_id'];
            isOneToOne: false;
            referencedRelation: 'reservations';
            referencedColumns: ['id'];
          },
        ];
      };
      post_images: {
        Row: {
          created_at: string;
          expires_at: string | null;
          id: string;
          post_id: string;
          sort_order: number;
          storage_path: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          post_id: string;
          sort_order?: number;
          storage_path: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          post_id?: string;
          sort_order?: number;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'post_images_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      post_expiration_logs: {
        Row: {
          attempt: number;
          created_at: string;
          event:
            | 'archived'
            | 'storage_cleanup_succeeded'
            | 'storage_cleanup_failed'
            | 'cleanup_skipped';
          id: string;
          image_count: number;
          message: string | null;
          post_id: string | null;
        };
        Insert: {
          attempt?: number;
          created_at?: string;
          event:
            | 'archived'
            | 'storage_cleanup_succeeded'
            | 'storage_cleanup_failed'
            | 'cleanup_skipped';
          id?: string;
          image_count?: number;
          message?: string | null;
          post_id?: string | null;
        };
        Update: {
          attempt?: number;
          created_at?: string;
          event?:
            | 'archived'
            | 'storage_cleanup_succeeded'
            | 'storage_cleanup_failed'
            | 'cleanup_skipped';
          id?: string;
          image_count?: number;
          message?: string | null;
          post_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'post_expiration_logs_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      post_boosts: {
        Row: {
          amount_tetri: number;
          created_at: string;
          expires_at: string;
          id: string;
          owner_id: string;
          payment_provider: string | null;
          payment_reference: string | null;
          plan: 'day' | 'three_days' | 'week';
          post_id: string;
          starts_at: string;
          status: 'pending' | 'demo_paid' | 'paid' | 'failed' | 'refunded';
        };
        Insert: {
          amount_tetri: number;
          created_at?: string;
          expires_at: string;
          id?: string;
          owner_id: string;
          payment_provider?: string | null;
          payment_reference?: string | null;
          plan: 'day' | 'three_days' | 'week';
          post_id: string;
          starts_at?: string;
          status?: 'pending' | 'demo_paid' | 'paid' | 'failed' | 'refunded';
        };
        Update: {
          amount_tetri?: number;
          created_at?: string;
          expires_at?: string;
          id?: string;
          owner_id?: string;
          payment_provider?: string | null;
          payment_reference?: string | null;
          plan?: 'day' | 'three_days' | 'week';
          post_id?: string;
          starts_at?: string;
          status?: 'pending' | 'demo_paid' | 'paid' | 'failed' | 'refunded';
        };
        Relationships: [
          {
            foreignKeyName: 'post_boosts_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_boosts_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      posts: {
        Row: {
          boost_expires_at: string | null;
          category: string;
          condition: 'new' | 'good' | 'used' | 'needs_repair';
          cleanup_attempts: number;
          cleanup_error: string | null;
          created_at: string;
          description: string;
          expired_at: string | null;
          expires_at: string;
          id: string;
          location: string;
          owner_id: string;
          storage_cleaned_at: string | null;
          status: 'available' | 'reserved' | 'given' | 'archived';
          title: string;
          updated_at: string;
        };
        Insert: {
          boost_expires_at?: string | null;
          category: string;
          condition: 'new' | 'good' | 'used' | 'needs_repair';
          cleanup_attempts?: number;
          cleanup_error?: string | null;
          created_at?: string;
          description: string;
          expired_at?: string | null;
          expires_at?: string;
          id?: string;
          location: string;
          owner_id: string;
          storage_cleaned_at?: string | null;
          status?: 'available' | 'reserved' | 'given' | 'archived';
          title: string;
          updated_at?: string;
        };
        Update: {
          boost_expires_at?: string | null;
          category?: string;
          condition?: 'new' | 'good' | 'used' | 'needs_repair';
          cleanup_attempts?: number;
          cleanup_error?: string | null;
          created_at?: string;
          description?: string;
          expired_at?: string | null;
          expires_at?: string;
          id?: string;
          location?: string;
          owner_id?: string;
          storage_cleaned_at?: string | null;
          status?: 'available' | 'reserved' | 'given' | 'archived';
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          clerk_user_id: string | null;
          created_at: string;
          display_name: string;
          id: string;
          location: string;
          phone_number: string | null;
          role: 'member' | 'admin';
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          clerk_user_id?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          location: string;
          phone_number?: string | null;
          role?: 'member' | 'admin';
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          clerk_user_id?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          location?: string;
          phone_number?: string | null;
          role?: 'member' | 'admin';
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          post_id: string | null;
          reporter_id: string | null;
          status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
          subject: string;
          updated_at: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          reporter_id?: string | null;
          status?: 'open' | 'reviewing' | 'resolved' | 'dismissed';
          subject: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          reporter_id?: string | null;
          status?: 'open' | 'reviewing' | 'resolved' | 'dismissed';
          subject?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      reservations: {
        Row: {
          cancelled_at: string | null;
          cancelled_by: string | null;
          created_at: string;
          expires_at: string | null;
          id: string;
          owner_id: string;
          post_id: string;
          requester_id: string;
          status:
            | 'pending'
            | 'accepted'
            | 'declined'
            | 'cancelled'
            | 'completed';
          updated_at: string;
        };
        Insert: {
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          owner_id: string;
          post_id: string;
          requester_id: string;
          status?:
            | 'pending'
            | 'accepted'
            | 'declined'
            | 'cancelled'
            | 'completed';
          updated_at?: string;
        };
        Update: {
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          owner_id?: string;
          post_id?: string;
          requester_id?: string;
          status?:
            | 'pending'
            | 'accepted'
            | 'declined'
            | 'cancelled'
            | 'completed';
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reservations_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reservations_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reservations_requester_id_fkey';
            columns: ['requester_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      activate_demo_post_boost: {
        Args: {
          selected_plan: string;
          target_post_id: string;
        };
        Returns: Database['public']['Tables']['posts']['Row'];
      };
      admin_dashboard_stats: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      create_profile_for_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      current_profile_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      current_profile_has_phone: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      ensure_clerk_profile: {
        Args: {
          avatar_url_input?: string | null;
          display_name_input: string;
        };
        Returns: string;
      };
      get_feed_posts: {
        Args: {
          boosted_only?: boolean;
          category_filter?: string;
          city_filter?: string;
          page_limit?: number;
          page_offset?: number;
          search_query?: string;
        };
        Returns: Array<{
          boost_expires_at: string | null;
          category: string;
          created_at: string;
          description: string;
          expires_at: string;
          first_image_storage_path: string | null;
          id: string;
          location: string;
          status: string;
          title: string;
        }>;
      };
      set_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      expire_reservations: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      mark_expired_posts: {
        Args: {
          batch_size?: number;
        };
        Returns: number;
      };
      reserve_post: {
        Args: {
          target_post_id: string;
        };
        Returns: Database['public']['Tables']['reservations']['Row'];
      };
      reserve_post_instant_demo: {
        Args: {
          target_post_id: string;
        };
        Returns: Database['public']['Tables']['reservations']['Row'];
      };
      reservation_penalty_until: {
        Args: {
          target_profile_id?: string;
        };
        Returns: string | null;
      };
      cancel_reservation: {
        Args: {
          target_reservation_id: string;
        };
        Returns: Database['public']['Tables']['reservations']['Row'];
      };
      mark_post_given: {
        Args: {
          target_post_id: string;
        };
        Returns: Database['public']['Tables']['posts']['Row'];
      };
      manage_reservation: {
        Args: {
          target_reservation_id: string;
          next_status: 'accepted' | 'declined' | 'cancelled' | 'completed';
        };
        Returns: Database['public']['Tables']['reservations']['Row'];
      };
      send_chat_message: {
        Args: {
          message_body: string;
          target_reservation_id: string;
        };
        Returns: Database['public']['Tables']['messages']['Row'];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
