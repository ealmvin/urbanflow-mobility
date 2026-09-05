import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const IDFM_BASE = 'https://prim.iledefrance-mobilites.fr/marketplace/v2/navitia'
const API_KEY = process.env.IDFM_API_KEY!

const CO2_FACTORS = {
  car_solo: 0.217,
  carpool: 0.054,
  metro_bus: 0.006,
  train: 0.004,
  velo: 0,
  trottinette: 0.003,
}

const TRAIN_PHYSICAL_MODES = [
  'physical_mode:Train',
  'physical_mode:RapidTransit',
  'physical_mode:LongDistanceTrain',
  'physical_mode:LocalTrain',
  'physical_mode:Shuttle',
]

async function navitiaFetch(path: string) {
  const res = await fetch(`${IDFM_BASE}${path}`, {
    headers: { apikey: API_KEY },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Navitia ${res.status}`)
  return res.json()
}

function secToMin(s: number) { return Math.round(s / 60) }
function mToStr(m: number) { return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m` }

function fmtTime(s: string) {
  if (!s || s.length < 13) return '--:--'
  if (s.length === 15) return `${s.slice(9, 11)}:${s.slice(11, 13)}`
  return s.slice(11, 16)
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function hasTrainSection(sections: any[]): boolean {
  return sections.some(
    (s) =>
      s.type === 'public_transport' &&
      TRAIN_PHYSICAL_MODES.some(
        (m) =>
          s.display_informations?.physical_mode === m ||
          (s.display_informations?.physical_mode ?? '').includes('Train') ||
          (s.display_informations?.physical_mode ?? '').includes('RapidTransit')
      )
  )
}

function parseNavitiaJourney(
  j: any,
  distanceKm: number,
  co2Car: number,
  idx: number,
  isTrainJourney: boolean
) {
  const durationMin = secToMin(j.duration)
  const factor = isTrainJourney ? CO2_FACTORS.train : CO2_FACTORS.metro_bus
  const co2TC = distanceKm * factor
  const co2Saved = Math.max(0, co2Car - co2TC)
  const points = Math.round(co2Saved * 40)

  const steps: any[] = []
  const sections = j.sections ?? []

  sections.forEach((s: any) => {
    if (s.type === 'waiting') return

    if (s.type === 'street_network' || s.type === 'transfer') {
      const dist = s.geojson?.properties?.length ?? s.duration * 1.2
      steps.push({
        type: 'walk',
        label: 'Marche',
        from: s.from?.stop_point?.name ?? s.from?.address?.name ?? '',
        to: s.to?.stop_point?.name ?? s.to?.address?.name ?? '',
        durationMin: secToMin(s.duration),
        distance: mToStr(Math.round(dist)),
      })
    }

    if (s.type === 'public_transport') {
      const di = s.display_informations ?? {}
      const stops = s.stop_date_times ?? []
      const nbStops = stops.length > 0 ? stops.length - 1 : null
      const isTrain =
        (di.physical_mode ?? '').includes('Train') ||
        (di.physical_mode ?? '').includes('RapidTransit')

      steps.push({
        type: 'transit',
        line: di.code ?? di.headsign ?? '',
        lineColor: di.color ? `#${di.color}` : (isTrain ? '#c0392b' : '#6b7280'),
        mode: di.physical_mode ?? 'TC',
        direction: di.direction ?? di.headsign ?? '',
        from: s.from?.stop_point?.name ?? '',
        to: s.to?.stop_point?.name ?? '',
        departureTime: fmtTime(s.departure_date_time),
        arrivalTime: fmtTime(s.arrival_date_time),
        durationMin: secToMin(s.duration),
        nbStops,
      })
    }
  })

  const summarySegments = steps.map((s) => {
    if (s.type === 'walk') return { type: 'walk', duration: s.durationMin }
    return { type: 'transit', line: s.line, color: s.lineColor, duration: s.durationMin }
  })

  if (isTrainJourney) {
    // Estimer le prix SNCF selon la distance
    const sncfPrice =
      distanceKm < 30
        ? '5,20 € – 12 €'
        : distanceKm < 80
        ? '12 € – 28 €'
        : '28 € – 65 €'

    return {
      id: `train-${idx}`,
      type: 'train',
      label: idx === 0 ? 'Train SNCF / RER · Le plus rapide' : 'Train SNCF / RER · Direct',
      emoji: '🚄',
      color: '#c0392b',
      durationMin,
      departureTime: fmtTime(j.departure_date_time),
      arrivalTime: fmtTime(j.arrival_date_time),
      distanceKm: Math.round(distanceKm * 10) / 10,
      co2Kg: Math.round(co2TC * 100) / 100,
      co2SavedKg: Math.round(co2Saved * 100) / 100,
      price: sncfPrice,
      points,
      steps,
      summarySegments,
      isRealtime: true,
    }
  }

  return {
    id: `tc-${idx}`,
    type: 'transit',
    label: idx === 0 ? 'Transports en commun · Le plus rapide' : 'Transports en commun · Moins de correspondances',
    emoji: '🚇',
    color: '#2563eb',
    durationMin,
    departureTime: fmtTime(j.departure_date_time),
    arrivalTime: fmtTime(j.arrival_date_time),
    distanceKm: Math.round(distanceKm * 10) / 10,
    co2Kg: Math.round(co2TC * 100) / 100,
    co2SavedKg: Math.round(co2Saved * 100) / 100,
    price: 'Navigo / 2,10 €',
    points,
    steps,
    summarySegments,
    isRealtime: true,
  }
}


export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get('from')
  const to = req.nextUrl.searchParams.get('to')
  const fromName = req.nextUrl.searchParams.get('fromName') || 'Départ'
  const toName = req.nextUrl.searchParams.get('toName') || 'Destination'

  if (!from || !to)
    return NextResponse.json({ error: 'from et to requis' }, { status: 400 })

  const [fromLat, fromLng] = from.split(',').map(Number)
  const [toLat, toLng] = to.split(',').map(Number)
  const distanceKm = haversineKm(fromLat, fromLng, toLat, toLng)
  const co2Car = distanceKm * CO2_FACTORS.car_solo
  const routes: any[] = []
  let trainAdded = false

  // ── Navitia : journeys standard (TC) ──
  try {
    const data = await navitiaFetch(
      `/journeys?from=${fromLng};${fromLat}&to=${toLng};${toLat}&count=4`
    )
    const journeys: any[] = data?.journeys ?? []

    // Séparer trains et TC classique
    const trainJourneys = journeys.filter((j) => hasTrainSection(j.sections ?? []))
    const tcJourneys = journeys.filter((j) => !hasTrainSection(j.sections ?? []))

    // Ajouter les trains en premier (max 1)
    trainJourneys.slice(0, 1).forEach((j, i) => {
      routes.push(parseNavitiaJourney(j, distanceKm, co2Car, i, true))
      trainAdded = true
    })

    // Ajouter les TC classiques (max 2)
    tcJourneys.slice(0, 2).forEach((j, i) => {
      routes.push(parseNavitiaJourney(j, distanceKm, co2Car, i, false))
    })
  } catch (e) {
    console.error('Navitia TC:', e)
  }

  // ── Navitia : forcer mode Train (RER / Transilien) ──
  if (!trainAdded) {
    try {
      const data = await navitiaFetch(
        `/journeys?from=${fromLng};${fromLat}&to=${toLng};${toLat}&count=3` +
          `&allowed_id[]=physical_mode:Train` +
          `&allowed_id[]=physical_mode:RapidTransit` +
          `&first_section_mode[]=walking&last_section_mode[]=walking`
      )
      const trainJourneys: any[] = (data?.journeys ?? []).filter((j: any) =>
        hasTrainSection(j.sections ?? [])
      )
      trainJourneys.slice(0, 1).forEach((j, i) => {
        routes.push(parseNavitiaJourney(j, distanceKm, co2Car, i, true))
      })
    } catch (e) {
      console.error('Navitia Train:', e)
    }
  }

  // ── Vélo ──
  if (distanceKm <= 10) {
    const dur = Math.max(5, Math.round((distanceKm / 14) * 60))
    const co2Saved = Math.max(0, co2Car)
    routes.push({
      id: 'velo',
      type: 'velo',
      label: 'Vélib — option écolo',
      emoji: '🚲',
      color: '#16a34a',
      durationMin: dur,
      departureTime: '--',
      arrivalTime: '--',
      distanceKm: Math.round(distanceKm * 10) / 10,
      co2Kg: 0,
      co2SavedKg: Math.round(co2Saved * 100) / 100,
      price: 'Vélib : 1 € / 30 min',
      points: Math.round(co2Saved * 40),
      steps: [
        { type: 'walk', label: 'Marche vers station Vélib', from: fromName, to: 'Station Vélib proche', durationMin: 3, distance: '200 m' },
        { type: 'bike', label: 'Trajet à vélo', from: 'Station Vélib proche', to: 'Station Vélib arrivée', durationMin: Math.max(1, dur - 6), distance: `${Math.round(distanceKm * 10) / 10} km` },
        { type: 'walk', label: 'Marche vers destination', from: 'Station Vélib arrivée', to: toName, durationMin: 3, distance: '150 m' },
      ],
      summarySegments: [
        { type: 'walk', duration: 3 },
        { type: 'bike', duration: Math.max(1, dur - 6) },
        { type: 'walk', duration: 3 },
      ],
      nearbyStations: [
        { name: `Station ${fromName.slice(0, 20)}`, available: 8, dist: 200 },
        { name: `Station ${toName.slice(0, 20)}`, available: 3, dist: 150 },
      ],
      isRealtime: false,
    })
  }

  // ── Trottinette ──
  if (distanceKm <= 7) {
    const dur = Math.max(3, Math.round((distanceKm / 18) * 60))
    const co2Scooter = distanceKm * CO2_FACTORS.trottinette
    const co2Saved = Math.max(0, co2Car - co2Scooter)
    const price = Math.round((1 + distanceKm * 0.25) * 10) / 10
    routes.push({
      id: 'trottinette',
      type: 'trottinette',
      label: 'Trottinette Lime',
      emoji: '🛴',
      color: '#84cc16',
      durationMin: dur,
      departureTime: '--',
      arrivalTime: '--',
      distanceKm: Math.round(distanceKm * 10) / 10,
      co2Kg: Math.round(co2Scooter * 100) / 100,
      co2SavedKg: Math.round(co2Saved * 100) / 100,
      price: `~${price} €`,
      points: Math.round(co2Saved * 40),
      steps: [
        { type: 'walk', label: 'Marche vers trottinette', from: fromName, to: 'Trottinette Lime proche', durationMin: 2, distance: '120 m' },
        { type: 'scooter', label: 'Trajet en trottinette', from: 'Position trottinette', to: toName, durationMin: Math.max(1, dur - 2), distance: `${Math.round(distanceKm * 10) / 10} km` },
      ],
      summarySegments: [{ type: 'scooter', duration: dur }],
      isRealtime: false,
    })
  }

  // ── Covoiturage UrbanFlow (plateforme interne) ──
  const durCarpool = Math.max(10, Math.round((distanceKm / 70) * 60))
  const co2Carpool = distanceKm * CO2_FACTORS.carpool
  const co2SavedCarpool = Math.max(0, co2Car - co2Carpool)
  const estimatedPrice = Math.round(distanceKm * 0.06 * 10) / 10
  routes.push({
    id: 'covoiturage-platform',
    type: 'carpool_platform',
    label: 'Covoiturage UrbanFlow',
    emoji: '🚗',
    color: '#f97316',
    durationMin: durCarpool,
    departureTime: '--',
    arrivalTime: '--',
    distanceKm: Math.round(distanceKm * 10) / 10,
    co2Kg: Math.round(co2Carpool * 100) / 100,
    co2SavedKg: Math.round(co2SavedCarpool * 100) / 100,
    price: `~${estimatedPrice} € / place`,
    points: Math.round(co2SavedCarpool * 40),
    steps: [],
    summarySegments: [{ type: 'car', duration: durCarpool }],
    isRealtime: false,
    redirectTo: '/dashboard/covoiturage',
  })

  // ── Historique Supabase ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('itinerary_history').insert({
        user_id: user.id,
        from_name: fromName,
        to_name: toName,
        from_lat: fromLat,
        from_lng: fromLng,
        to_lat: toLat,
        to_lng: toLng,
        distance_km: Math.round(distanceKm * 100) / 100,
        routes_count: routes.length,
      })
    }
  } catch {}

  return NextResponse.json({ routes, distanceKm: Math.round(distanceKm * 10) / 10 })
}
