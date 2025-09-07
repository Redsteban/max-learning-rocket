import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role key
// WARNING: Never expose this to the client-side!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Only create admin client if we have the required environment variables
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null as any // Return null if env vars are missing, but typed as any for compatibility

// Helper function to check if we're on the server
export const isServer = () => typeof window === 'undefined'