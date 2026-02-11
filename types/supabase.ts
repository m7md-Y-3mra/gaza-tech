import { Specification } from "@/modules/listings/types";

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
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      bookmarked_listings: {
        Row: {
          created_at: string | null;
          listing_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          listing_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          listing_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookmarked_listings_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'marketplace_listings';
            referencedColumns: ['listing_id'];
          },
          {
            foreignKeyName: 'bookmarked_listings_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'bookmarked_listings_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users_with_email';
            referencedColumns: ['user_id'];
          },
        ];
      };
      bookmarked_posts: {
        Row: {
          created_at: string | null;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookmarked_posts_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'community_posts';
            referencedColumns: ['post_id'];
          },
          {
            foreignKeyName: 'bookmarked_posts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'bookmarked_posts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users_with_email';
            referencedColumns: ['user_id'];
          },
        ];
      };
      community_comments_likes: {
        Row: {
          comment_id: string;
          created_at: string | null;
          user_id: string;
        };
        Insert: {
          comment_id: string;
          created_at?: string | null;
          user_id: string;
        };
        Update: {
          comment_id?: string;
          created_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'community_comments_likes_comment_id_fkey';
            columns: ['comment_id'];
            isOneToOne: false;
            referencedRelation: 'community_post_comments';
            referencedColumns: ['comment_id'];
          },
          {
            foreignKeyName: 'community_comments_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'community_comments_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users_with_email';
            referencedColumns: ['user_id'];
          },
        ];
      };
      community_post_comments: {
        Row: {
          author_id: string;
          comment_id: string;
          content: string;
          created_at: string | null;
          edited_at: string | null;
          is_edited: boolean | null;
          post_id: string;
          updated_at: string | null;
        };
        Insert: {
          author_id: string;
          comment_id?: string;
          content: string;
          created_at?: string | null;
          edited_at?: string | null;
          is_edited?: boolean | null;
          post_id: string;
          updated_at?: string | null;
        };
        Update: {
          author_id?: string;
          comment_id?: string;
          content?: string;
          created_at?: string | null;
          edited_at?: string | null;
          is_edited?: boolean | null;
          post_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'community_post_comments_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'community_post_comments_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users_with_email';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'community_post_comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'community_posts';
            referencedColumns: ['post_id'];
          },
        ];
      };
      community_posts: {
        Row: {
          author_id: string;
          content: string;
          content_status: string | null;
          created_at: string | null;
          post_category: string;
          post_id: string;
          published_at: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          author_id: string;
          content: string;
          content_status?: string | null;
          created_at?: string | null;
          post_category?: string;
          post_id?: string;
          published_at?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          author_id?: string;
          content?: string;
          content_status?: string | null;
          created_at?: string | null;
          post_category?: string;
          post_id?: string;
          published_at?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'community_posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'community_posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users_with_email';
            referencedColumns: ['user_id'];
          },
        ];
      };
      community_posts_attachments: {
        Row: {
          attachment_id: string;
          created_at: string | null;
          file_url: string;
          post_id: string;
        };
        Insert: {
          attachment_id?: string;
          created_at?: string | null;
          file_url: string;
          post_id: string;
        };
        Update: {
          attachment_id?: string;
          created_at?: string | null;
          file_url?: string;
          post_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'community_posts_attachments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'community_posts';
            referencedColumns: ['post_id'];
          },
        ];
      };
      community_posts_likes: {
        Row: {
          created_at: string | null;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'community_posts_likes_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'community_posts';
            referencedColumns: ['post_id'];
          },
          {
            foreignKeyName: 'community_posts_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'community_posts_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users_with_email';
            referencedColumns: ['user_id'];
          },
        ];
      };
      listing_images: {
        Row: {
          created_at: string | null;
          image_url: string;
          is_thumbnail: boolean | null;
          listing_id: string;
          listing_image_id: string;
          sort_order: number | null;
        };
        Insert: {
          created_at?: string | null;
          image_url: string;
          is_thumbnail?: boolean | null;
          listing_id: string;
          listing_image_id?: string;
          sort_order?: number | null;
        };
        Update: {
          created_at?: string | null;
          image_url?: string;
          is_thumbnail?: boolean | null;
          listing_id?: string;
          listing_image_id?: string;
          sort_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_images_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'marketplace_listings';
            referencedColumns: ['listing_id'];
          },
        ];
      };
      locations: {
        Row: {
          created_at: string | null;
          is_active: boolean | null;
          location_id: string;
          name: string;
          name_ar: string;
          slug: string;
          sort_order: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          is_active?: boolean | null;
          location_id?: string;
          name: string;
          name_ar: string;
          slug: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          is_active?: boolean | null;
          location_id?: string;
          name?: string;
          name_ar?: string;
          slug?: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      marketplace_categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          icon_url: string | null;
          is_active: boolean | null;
          marketplace_category_id: string;
          name: string;
          parent_id: string | null;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          icon_url?: string | null;
          is_active?: boolean | null;
          marketplace_category_id?: string;
          name: string;
          parent_id?: string | null;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          icon_url?: string | null;
          is_active?: boolean | null;
          marketplace_category_id?: string;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'marketplace_categories_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'marketplace_categories';
            referencedColumns: ['marketplace_category_id'];
          },
        ];
      };
      marketplace_listings: {
        Row: {
          category_id: string;
          content_status: string | null;
          created_at: string | null;
          currency: string | null;
          description: string;
          listing_id: string;
          location_id: string;
          price: number;
          product_condition: string;
          seller_id: string;
          specifications: Specification[] | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          category_id: string;
          content_status?: string | null;
          created_at?: string | null;
          currency?: string | null;
          description: string;
          listing_id?: string;
          location_id: string;
          price: number;
          product_condition: string;
          seller_id: string;
          specifications?: Json | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          category_id?: string;
          content_status?: string | null;
          created_at?: string | null;
          currency?: string | null;
          description?: string;
          listing_id?: string;
          location_id?: string;
          price?: number;
          product_condition?: string;
          seller_id?: string;
          specifications?: Json | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'marketplace_listings_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'marketplace_categories';
            referencedColumns: ['marketplace_category_id'];
          },
          {
            foreignKeyName: 'marketplace_listings_location_id_fkey';
            columns: ['location_id'];
            isOneToOne: false;
            referencedRelation: 'locations';
            referencedColumns: ['location_id'];
          },
          {
            foreignKeyName: 'marketplace_listings_seller_id_fkey';
            columns: ['seller_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'marketplace_listings_seller_id_fkey';
            columns: ['seller_id'];
            isOneToOne: false;
            referencedRelation: 'users_with_email';
            referencedColumns: ['user_id'];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string | null;
          description: string;
          is_read: boolean | null;
          notification_data: Json | null;
          notification_id: string;
          notification_type: string;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description: string;
          is_read?: boolean | null;
          notification_data?: Json | null;
          notification_id?: string;
          notification_type: string;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string;
          is_read?: boolean | null;
          notification_data?: Json | null;
          notification_id?: string;
          notification_type?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users_with_email';
            referencedColumns: ['user_id'];
          },
        ];
      };
      reports: {
        Row: {
          action_taken: string | null;
          created_at: string | null;
          description: string | null;
          reason: string;
          report_id: string;
          report_status: string | null;
          reported_comment_id: string | null;
          reported_listing_id: string | null;
          reported_post_id: string | null;
          reported_user_id: string | null;
          reporter_id: string;
          resolution_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          updated_at: string | null;
        };
        Insert: {
          action_taken?: string | null;
          created_at?: string | null;
          description?: string | null;
          reason: string;
          report_id?: string;
          report_status?: string | null;
          reported_comment_id?: string | null;
          reported_listing_id?: string | null;
          reported_post_id?: string | null;
          reported_user_id?: string | null;
          reporter_id: string;
          resolution_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          updated_at?: string | null;
        };
        Update: {
          action_taken?: string | null;
          created_at?: string | null;
          description?: string | null;
          reason?: string;
          report_id?: string;
          report_status?: string | null;
          reported_comment_id?: string | null;
          reported_listing_id?: string | null;
          reported_post_id?: string | null;
          reported_user_id?: string | null;
          reporter_id?: string;
          resolution_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_reported_comment_id_fkey';
            columns: ['reported_comment_id'];
            isOneToOne: false;
            referencedRelation: 'community_post_comments';
            referencedColumns: ['comment_id'];
          },
          {
            foreignKeyName: 'reports_reported_listing_id_fkey';
            columns: ['reported_listing_id'];
            isOneToOne: false;
            referencedRelation: 'marketplace_listings';
            referencedColumns: ['listing_id'];
          },
          {
            foreignKeyName: 'reports_reported_post_id_fkey';
            columns: ['reported_post_id'];
            isOneToOne: false;
            referencedRelation: 'community_posts';
            referencedColumns: ['post_id'];
          },
          {
            foreignKeyName: 'reports_reported_user_id_fkey';
            columns: ['reported_user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'reports_reported_user_id_fkey';
            columns: ['reported_user_id'];
            isOneToOne: false;
            referencedRelation: 'users_with_email';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'users_with_email';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'reports_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'reports_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'users_with_email';
            referencedColumns: ['user_id'];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          ban_reason: string | null;
          banned_expires_at: string | null;
          bio: string | null;
          created_at: string | null;
          facebook_link_url: string | null;
          first_name: string;
          instagram_link_url: string | null;
          is_active: boolean | null;
          is_verified: boolean | null;
          last_activity_at: string | null;
          last_name: string;
          phone_number: string | null;
          terms_accepted_at: string | null;
          twitter_link_url: string | null;
          updated_at: string | null;
          user_id: string;
          user_role: string | null;
          website_url: string | null;
          whatsapp_number: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          ban_reason?: string | null;
          banned_expires_at?: string | null;
          bio?: string | null;
          created_at?: string | null;
          facebook_link_url?: string | null;
          first_name: string;
          instagram_link_url?: string | null;
          is_active?: boolean | null;
          is_verified?: boolean | null;
          last_activity_at?: string | null;
          last_name: string;
          phone_number?: string | null;
          terms_accepted_at?: string | null;
          twitter_link_url?: string | null;
          updated_at?: string | null;
          user_id: string;
          user_role?: string | null;
          website_url?: string | null;
          whatsapp_number?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          ban_reason?: string | null;
          banned_expires_at?: string | null;
          bio?: string | null;
          created_at?: string | null;
          facebook_link_url?: string | null;
          first_name?: string;
          instagram_link_url?: string | null;
          is_active?: boolean | null;
          is_verified?: boolean | null;
          last_activity_at?: string | null;
          last_name?: string;
          phone_number?: string | null;
          terms_accepted_at?: string | null;
          twitter_link_url?: string | null;
          updated_at?: string | null;
          user_id?: string;
          user_role?: string | null;
          website_url?: string | null;
          whatsapp_number?: string | null;
        };
        Relationships: [];
      };
      verification_requests: {
        Row: {
          address: string;
          address_verified: boolean | null;
          age_verified: boolean | null;
          assigned_to: string | null;
          blacklist_check_passed: boolean | null;
          created_at: string | null;
          document_authenticity_score: number | null;
          document_back_url: string;
          document_front_url: string;
          document_not_expired: boolean | null;
          document_type: string;
          documents_verified: boolean | null;
          duplicate_check_passed: boolean | null;
          email_verified: boolean | null;
          expires_at: string | null;
          face_match_score: number | null;
          face_matches_id: boolean | null;
          id_date_of_birth: string;
          id_full_name: string;
          id_gender: string | null;
          id_number_valid: boolean | null;
          name_matches: boolean | null;
          national_id_number: string;
          no_tampering_signs: boolean | null;
          phone_otp_attempts: number | null;
          phone_otp_code: string | null;
          phone_otp_expires_at: string | null;
          phone_verified: boolean | null;
          priority: string | null;
          rejection_reason: string | null;
          review_notes: string | null;
          reviewed_at: string | null;
          selfie_is_live: boolean | null;
          selfie_with_id_url: string;
          submitted_at: string | null;
          updated_at: string | null;
          user_id: string;
          verification_request_id: string;
          verification_status: string | null;
        };
        Insert: {
          address: string;
          address_verified?: boolean | null;
          age_verified?: boolean | null;
          assigned_to?: string | null;
          blacklist_check_passed?: boolean | null;
          created_at?: string | null;
          document_authenticity_score?: number | null;
          document_back_url: string;
          document_front_url: string;
          document_not_expired?: boolean | null;
          document_type: string;
          documents_verified?: boolean | null;
          duplicate_check_passed?: boolean | null;
          email_verified?: boolean | null;
          expires_at?: string | null;
          face_match_score?: number | null;
          face_matches_id?: boolean | null;
          id_date_of_birth: string;
          id_full_name: string;
          id_gender?: string | null;
          id_number_valid?: boolean | null;
          name_matches?: boolean | null;
          national_id_number: string;
          no_tampering_signs?: boolean | null;
          phone_otp_attempts?: number | null;
          phone_otp_code?: string | null;
          phone_otp_expires_at?: string | null;
          phone_verified?: boolean | null;
          priority?: string | null;
          rejection_reason?: string | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          selfie_is_live?: boolean | null;
          selfie_with_id_url: string;
          submitted_at?: string | null;
          updated_at?: string | null;
          user_id: string;
          verification_request_id?: string;
          verification_status?: string | null;
        };
        Update: {
          address?: string;
          address_verified?: boolean | null;
          age_verified?: boolean | null;
          assigned_to?: string | null;
          blacklist_check_passed?: boolean | null;
          created_at?: string | null;
          document_authenticity_score?: number | null;
          document_back_url?: string;
          document_front_url?: string;
          document_not_expired?: boolean | null;
          document_type?: string;
          documents_verified?: boolean | null;
          duplicate_check_passed?: boolean | null;
          email_verified?: boolean | null;
          expires_at?: string | null;
          face_match_score?: number | null;
          face_matches_id?: boolean | null;
          id_date_of_birth?: string;
          id_full_name?: string;
          id_gender?: string | null;
          id_number_valid?: boolean | null;
          name_matches?: boolean | null;
          national_id_number?: string;
          no_tampering_signs?: boolean | null;
          phone_otp_attempts?: number | null;
          phone_otp_code?: string | null;
          phone_otp_expires_at?: string | null;
          phone_verified?: boolean | null;
          priority?: string | null;
          rejection_reason?: string | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          selfie_is_live?: boolean | null;
          selfie_with_id_url?: string;
          submitted_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
          verification_request_id?: string;
          verification_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'verification_requests_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'verification_requests_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'users_with_email';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'verification_requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'verification_requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users_with_email';
            referencedColumns: ['user_id'];
          },
        ];
      };
    };
    Views: {
      users_with_email: {
        Row: {
          avatar_url: string | null;
          ban_reason: string | null;
          banned_expires_at: string | null;
          bio: string | null;
          created_at: string | null;
          email: string | null;
          email_confirmed_at: string | null;
          facebook_link_url: string | null;
          first_name: string | null;
          instagram_link_url: string | null;
          is_active: boolean | null;
          is_verified: boolean | null;
          last_activity_at: string | null;
          last_name: string | null;
          phone_number: string | null;
          terms_accepted_at: string | null;
          twitter_link_url: string | null;
          updated_at: string | null;
          user_id: string | null;
          user_role: string | null;
          website_url: string | null;
          whatsapp_number: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      validate_listing_specs: { Args: { specs: Json }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
    DefaultSchema['Views'])
  ? (DefaultSchema['Tables'] &
    DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
  ? R
  : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I;
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
  }
  ? I
  : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U;
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
  }
  ? U
  : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema['Enums']
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
  ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema['CompositeTypes']
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
  ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
