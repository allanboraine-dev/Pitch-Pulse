'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function uploadFixtures(formData: FormData) {
  const file = formData.get('csvFile') as File
  if (!file) return { error: 'No file uploaded.' }

  const text = await file.text()
  const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0)

  // Skip header if it exists
  const startIndex = rows[0].toLowerCase().includes('home') ? 1 : 0;
  
  const supabase = await createClient()

  // Verify manager auth
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (profile?.role !== 'manager') return { error: 'Only managers can load fixtures.' }

  const matchesToInsert = [];

  for (let i = startIndex; i < rows.length; i++) {
    const cols = rows[i].split(',').map(c => c.trim())
    if (cols.length < 5) continue; // Expecting 5 columns

    const [homeName, awayName, timeStr, season, oversStr] = cols;

    // Helper to get or create club
    const getOrCreateClubId = async (name: string) => {
      let { data: club } = await supabase.from('clubs').select('id').eq('name', name).single()
      if (!club) {
        // Create new club
        const { data: newClub, error } = await supabase.from('clubs').insert({ name }).select('id').single()
        if (error) throw new Error(`Failed to create club ${name}: ${error.message}`)
        club = newClub
      }
      return club.id
    }

    try {
      const homeTeamId = await getOrCreateClubId(homeName)
      const awayTeamId = await getOrCreateClubId(awayName)
      
      matchesToInsert.push({
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        scheduled_time: new Date(timeStr).toISOString(),
        season: season,
        max_overs: parseInt(oversStr) || 20,
        status: 'scheduled'
      })
    } catch (e: any) {
      return { error: `Error on row ${i + 1}: ${e.message}` }
    }
  }

  if (matchesToInsert.length === 0) {
    return { error: 'No valid rows found to insert.' }
  }

  // Bulk Insert
  const { error } = await supabase.from('matches').insert(matchesToInsert)

  if (error) {
    return { error: error.message }
  }

  redirect('/manager/dashboard?success=Fixtures+Loaded')
}
