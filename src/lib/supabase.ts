import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      countries: {
        Row: {
          id: string
          name: string
          country_code: string
          numeric_id: number
          visited_at: string | null
          cover_photo_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['countries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['countries']['Insert']>
      }
      photos: {
        Row: {
          id: string
          country_id: string
          url: string
          caption: string | null
          taken_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['photos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['photos']['Insert']>
      }
      friends: {
        Row: {
          id: string
          country_id: string
          name: string
          instagram_handle: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['friends']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['friends']['Insert']>
      }
      vlogs: {
        Row: {
          id: string
          country_id: string
          title: string
          url: string
          platform: 'youtube' | 'instagram' | 'tiktok'
          thumbnail_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['vlogs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['vlogs']['Insert']>
      }
    }
  }
}
