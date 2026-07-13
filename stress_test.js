import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ajqxlnniqtigenvtmtwq.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqcXhsbm5pcXRpZ2VudnRtdHdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mzg1Mjg0MiwiZXhwIjoyMDk5NDI4ODQyfQ.g2q3YMsb3afgXxKLHojBL09Z4LT_no7M3ETJUkpDw4I'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function runStressTest() {
  console.log('--- STARTING PITCH PULSE STRESS TEST ---')
  console.log('1. Setting up dummy teams...')

  // Create two clubs
  const { data: homeTeam, error: e1 } = await supabase.from('clubs').insert({ name: `Stress Home ${crypto.randomUUID().substring(0,4)}`, access_code: `STRESSH_${crypto.randomUUID().substring(0,4)}` }).select().single()
  const { data: awayTeam, error: e2 } = await supabase.from('clubs').insert({ name: `Stress Away ${crypto.randomUUID().substring(0,4)}`, access_code: `STRESSA_${crypto.randomUUID().substring(0,4)}` }).select().single()

  if (e1 || e2) return console.error('Error creating clubs:', e1, e2)

  // Create players
  let homePlayers = []
  let awayPlayers = []
  for (let i = 1; i <= 11; i++) {
    homePlayers.push({ id: crypto.randomUUID(), full_name: `Home Player ${i}`, club_id: homeTeam.id })
    awayPlayers.push({ id: crypto.randomUUID(), full_name: `Away Player ${i}`, club_id: awayTeam.id })
  }

  const { data: hpData, error: e3 } = await supabase.from('profiles').insert(homePlayers).select()
  const { data: apData, error: e4 } = await supabase.from('profiles').insert(awayPlayers).select()

  if (e3 || e4) return console.error('Error creating players:', e3, e4)

  console.log('2. Creating Match...')
  const { data: match, error: e5 } = await supabase.from('matches').insert({
    home_team_id: homeTeam.id,
    away_team_id: awayTeam.id,
    status: 'in_progress'
  }).select().single()

  if (e5) return console.error('Error creating match:', e5)

  // Create match squads
  const squads = []
  hpData.forEach(p => squads.push({ match_id: match.id, team_id: homeTeam.id, player_id: p.id }))
  apData.forEach(p => squads.push({ match_id: match.id, team_id: awayTeam.id, player_id: p.id }))

  const { error: e6 } = await supabase.from('match_squads').insert(squads)
  if (e6) return console.error('Error creating squads:', e6)

  console.log('3. Simulating 300 rapid-fire deliveries...')
  
  const deliveries = []
  const bowlerId = apData[0].id
  const batterId = hpData[0].id
  const nonStrikerId = hpData[1].id

  for (let ball = 1; ball <= 300; ball++) {
    const overNumber = Math.floor((ball - 1) / 6) + 1
    const ballNumber = ((ball - 1) % 6) + 1
    
    deliveries.push({
      match_id: match.id,
      innings_id: 1,
      over_number: overNumber,
      ball_number: ballNumber,
      bowler_id: bowlerId,
      batter_id: batterId,
      non_striker_id: nonStrikerId,
      runs_scored: Math.floor(Math.random() * 6), // 0 to 5 runs
      extras: null,
      wicket_type: null
    })
  }

  // Insert in batches of 50 to stress test without timing out
  let successCount = 0
  for (let i = 0; i < deliveries.length; i += 50) {
    const batch = deliveries.slice(i, i + 50)
    const { error: e7 } = await supabase.from('deliveries').insert(batch)
    if (e7) {
      console.error('Error inserting deliveries:', e7)
    } else {
      successCount += batch.length
      console.log(`Successfully inserted ${successCount} deliveries...`)
    }
  }

  console.log('--- STRESS TEST COMPLETED SUCCESSFULLY ---')
}

runStressTest()
