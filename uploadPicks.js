const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function upload() {
  const data = JSON.parse(fs.readFileSync('./picks-simulados.json', 'utf-8'))
  const allPicks = [...data.futbol, ...data.mlb]

  const rows = allPicks.map(function (p) {
    return {
      sport: p.sport,
      home: p.home,
      away: p.away,
      win_prob_home: p.winProbHome,
      draw_prob: p.drawProb || null,
      win_prob_away: p.winProbAway,
      pick: p.pick,
      match_date: p.date,
    }
  })

  const { data: inserted, error } = await supabase.from('picks').insert(rows).select()

  if (error) {
    console.error('Error subiendo picks:', error)
  } else {
    console.log('Picks subidos exitosamente:', inserted.length)
  }
}

upload()
