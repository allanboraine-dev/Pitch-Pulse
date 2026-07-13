import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ajqxlnniqtigenvtmtwq.supabase.co'
const supabaseAnonKey = 'sb_publishable_JSFlSAT1NWl76jGsAC8RzQ_WOF12U-r'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
  const { data, error } = await supabase.from('clubs').select('name, access_code')
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Clubs and Access Codes:')
    console.table(data)
  }
}

run()
