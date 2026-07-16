import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const API_KEY = process.env.API_SPORTS_KEY
const FOOTBALL_BASE = 'https://v3.football.api-sports.io'

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms) })
}

async function apiRequest(path, params) {
  const url = new URL(FOOTBALL_BASE + path)
  Object.entries(params).forEach(function ([k, v]) { url.searchParams.set(k, v) })
  const res = await fetch(url.toString(), { headers: { 'x-apisports-key': API_KEY } })
  const json = await res.json()
  return json.response
}

async function loadRatings(sport) {
  const { data } = await supabase.from('elo_ratings').select('*').eq('sport', sport)
  const ratings = {}
  ;(data || []).forEach(function (r) { ratings[r.team] = Number(r.rating) })
  return ratings
}

async function saveRatings(sport, ratings) {
  const rows = Object.entries(ratings).map(function ([team, rating]) {
    return { sport: sport, team: team, rating: rating }
  })
  if (rows.length > 0) {
    await supabase.from('elo_ratings').upsert(rows)
  }
}

function getRating(ratings, team) {
  return ratings[team] !== undefined ? ratings[team] : 1500
}

function expectedScore(ratings, home, away, homeAdv, extraHome, extraAway) {
  const rHome = getRating(ratings, home) + homeAdv + (extraHome || 0)
  const rAway = getRating(ratings, away) + (extraAway || 0)
  return 1 / (1 + Math.pow(10, (rAway - rHome) / 400))
}

function predictMatch(ratings, home, away, homeAdv, extraHome, extraAway) {
  const pHomeRaw = expectedScore(ratings, home, away, homeAdv, extraHome, extraAway)
  const ratingGap = Math.abs(
    getRating(ratings, home) + homeAdv + (extraHome || 0) - (getRating(ratings, away) + (extraAway || 0))
  )
  const drawProb = Math.max(0.18, 0.32 - ratingGap / 1000)
  const homeProb = pHomeRaw * (1 - drawProb)
  const awayProb = (1 - pHomeRaw) * (1 - drawProb)
  const probs = {}
  probs[home] = homeProb
  probs.empate = drawProb
  probs[away] = awayProb
  const pick = Object.keys(probs).reduce(function (a, b) { return probs[a] > probs[b] ? a : b })
  return {
    winProbHome: Math.round(homeProb * 1000) / 10,
    drawProb: Math.round(drawProb * 1000) / 10,
    winProbAway: Math.round(awayProb * 1000) / 10,
    pick: pick,
  }
}

function formaAPuntos(resultados) {
  if (!resultados || resultados.length === 0) return 0
  const puntos = resultados.reduce(function (acc, r) {
    if (r === 'W') return acc + 3
    if (r === 'D') return acc + 1
    return acc
  }, 0)
  const promedio = puntos / resultados.length
  return Math.round((promedio - 1.5) * 15)
}

async function getRecentForm(teamId) {
  await sleep(600)
  try {
    const fixtures = await apiRequest('/fixtures', { team: teamId, last: 5 })
    return fixtures.map(function (f) {
      const isHome = f.teams.home.id === teamId
      const gf = isHome ? f.goals.home : f.goals.away
      const gc = isHome ? f.goals.away : f.goals.home
      if (gf === null || gc === null) return null
      if (gf > gc) return 'W'
      if (gf < gc) return 'L'
      return 'D'
    }).filter(Boolean)
  } catch (e) {
    return []
  }
}

async function actualizarRatingsConHistorial(ratings, leagueId, season, kFactor, homeAdv) {
  const jugados = await apiRequest('/fixtures', { league: leagueId, season: season, status: 'FT' })
  jugados.sort(function (a, b) { return new Date(a.fixture.date) - new Date(b.fixture.date) })

  jugados.forEach(function (f) {
    const home = f.teams.home.name
    const away = f.teams.away.name
    const gh = f.goals.home
    const ga = f.goals.away
    if (gh === null || ga === null) return

    let result
    if (gh > ga) result = 1
    else if (gh < ga) result = 0
    else result = 0.5

    const rHome = getRating(ratings, home)
    const rAway = getRating(ratings, away)
    const expected = 1 / (1 + Math.pow(10, ((rAway - (rHome + homeAdv)) / 400)))
    ratings[home] = Math.round((rHome + kFactor * (result - expected)) * 100) / 100
    ratings[away] = Math.round((rAway + kFactor * ((1 - result) - (1 - expected))) * 100) / 100
  })

  return ratings
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const leagueId = 262
  const season = 2026
  const homeAdv = 60
  const kFactor = 20

  let ratings = await loadRatings('futbol')
  ratings = await actualizarRatingsConHistorial(ratings, leagueId, season, kFactor, homeAdv)

  const from = new Date().toISOString().slice(0, 10)
  const toDate = new Date()
  toDate.setDate(toDate.getDate() + 7)
  const to = toDate.toISOString().slice(0, 10)

  const upcoming = await apiRequest('/fixtures', { league: leagueId, season: season, from: from, to: to })

  const picks = []
  for (const f of upcoming) {
    const home = f.teams.home.name
    const away = f.teams.away.name
    const formaHome = await getRecentForm(f.teams.home.id)
    const formaAway = await getRecentForm(f.teams.away.id)
    const extraHome = formaAPuntos(formaHome)
    const extraAway = formaAPuntos(formaAway)
    const prediction = predictMatch(ratings, home, away, homeAdv, extraHome, extraAway)
    picks.push({
      sport: 'futbol',
      home: home,
      away: away,
      win_prob_home: prediction.winProbHome,
      draw_prob: prediction.drawProb,
      win_prob_away: prediction.winProbAway,
      pick: prediction.pick,
      match_date: f.fixture.date,
    })
  }

  await supabase.from('picks').delete().eq('sport', 'futbol')
  if (picks.length > 0) {
    await supabase.from('picks').insert(picks)
  }
  await saveRatings('futbol', ratings)

  return Response.json({ ok: true, picksGenerados: picks.length })
}
