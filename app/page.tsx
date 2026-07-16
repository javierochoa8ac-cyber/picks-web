import { supabase } from '../lib/supabaseClient'

export const dynamic = 'force-dynamic'

type Pick = {
  id: number
  sport: string
  home: string
  away: string
  win_prob_home: number
  draw_prob: number | null
  win_prob_away: number
  pick: string
  match_date: string
}

export default async function Home() {
  const { data: picks, error } = await supabase
    .from('picks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-red-600">Error cargando picks: {error.message}</div>
  }

  const allPicks = picks as Pick[]
  const futbolPicks = allPicks.filter(function (p) { return p.sport === 'futbol' })
  const mlbPicks = allPicks.filter(function (p) { return p.sport === 'mlb' })

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-1">Picks de hoy</h1>
        <p className="text-gray-400 text-sm mb-8">
          Basado en modelo estadistico Elo, no en promesas de ganancia
        </p>

        <Section title="Futbol" picks={futbolPicks} />
        <Section title="MLB" picks={mlbPicks} />

        <p className="text-xs text-gray-500 text-center mt-10">
          Contenido informativo, no es asesoria financiera. Apostar conlleva riesgo. +18.
        </p>
      </div>
    </main>
  )
}

function Section({ title, picks }: { title: string; picks: Pick[] }) {
  if (picks.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-3 text-gray-300">{title}</h2>
      <div className="space-y-3">
        {picks.map(function (p) {
          return (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{p.home} vs {p.away}</span>
                <span className="text-xs text-gray-500">{p.match_date}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-gray-800 pt-3">
                <span className="text-gray-400">Pick del modelo</span>
                <span className="font-medium text-emerald-400">{p.pick}</span>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>Local {p.win_prob_home}%</span>
                {p.draw_prob ? <span>Empate {p.draw_prob}%</span> : null}
                <span>Visitante {p.win_prob_away}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
