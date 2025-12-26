import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iwebrlwtotvskgrmlomv.supabase.co' 
const supabaseAnonKey = 'sb_publishable_HxodmVFJNOMUL6dsyRbHgw_koYJ367P'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)