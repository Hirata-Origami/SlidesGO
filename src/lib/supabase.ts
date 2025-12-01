import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cchjgccgkskwryqjpcvq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjaGpnY2Nna3Nrd3J5cWpwY3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MDU5OTAsImV4cCI6MjA4MDA4MTk5MH0.xwEPuUGB1Y76cG9FSU0zipQ69PBpFdIV60FRhkNBvdU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
