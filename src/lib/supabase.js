import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export function createSupabaseClient(getToken) {
	return createClient(supabaseUrl, supabaseAnonKey, {
		accessToken: async () => getToken({ template: 'supabase' }),
	})
}
