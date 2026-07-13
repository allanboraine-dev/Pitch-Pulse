import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ajqxlnniqtigenvtmtwq.supabase.co'
const supabaseAnonKey = 'sb_publishable_JSFlSAT1NWl76jGsAC8RzQ_WOF12U-r'

// We don't provide a session, so this simulates the anonymous client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
})

async function run() {
  const { data: club, error } = await supabase
    .from('clubs')
    .select('id')
    .eq('access_code', 'U9WWJQ')
    .single()
    
  if (error) {
    console.error('Error fetching club anonymously:', error)
  } else {
    console.log('Successfully fetched anonymously:', club)
  }
}

run()
