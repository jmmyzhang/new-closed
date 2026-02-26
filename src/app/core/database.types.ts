export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
        };
        Update: {
          username?: string;
          display_name?: string | null;
        };
      };
      clothing_items: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          category: string | null;
          processed_url: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name?: string | null;
          category?: string | null;
          processed_url: string;
        };
        Update: {
          name?: string | null;
          category?: string | null;
          processed_url?: string;
        };
      };
    };
  };
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ClothingItem = Database['public']['Tables']['clothing_items']['Row'];
