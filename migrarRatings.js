const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function migrar(archivo, sport) {
  const ratings = JSON.parse(fs.readFileSync(archivo, 'utf-8'))
  const rows = Object.entries(ratings).map(function ([team, rating]) {
    return { sport: sport, team: team, rating: rating }
  })
  const { error } = await supabase.from('elo_ratings').upsert(rows)
  if (error) console.error('Error migrando ' + sport + ':', error)
  else console.log('Migrados ' + rows.length + ' equipos de ' + sport)
}

async function main() {
  await migrar('../predictor-engine/ratings-futbol.json', 'futbol')
  await migrar('../predictor-engine/ratings-mundial.json', 'mundial')
}

main().catch(console.error)
