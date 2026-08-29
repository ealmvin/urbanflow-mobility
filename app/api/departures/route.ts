import { NextRequest, NextResponse } from 'next/server'

const IDFM_BASE = 'https://prim.iledefrance-mobilites.fr/marketplace/v2/navitia'
const API_KEY = process.env.IDFM_API_KEY!

async function navitiaFetch(path: string) {
  const res = await fetch(`${IDFM_BASE}${path}`, {
    headers: { apikey: API_KEY },
    next: { revalidate: 30 }, // cache 30 secondes
  })
  if (!res.ok) throw new Error(`Navitia error: ${res.status}`)
  return res.json()
}

export async function GET(req: NextRequest) {
  const station = req.nextUrl.searchParams.get('station')
  if (!station) {
    return NextResponse.json({ error: 'station param required' }, { status: 400 })
  }

  try {
    // 1. Trouver le stop_area ID
    const placesData = await navitiaFetch(
      `/places?q=${encodeURIComponent(station)}&type[]=stop_area&count=1`
    )

    const places = placesData?.places
    if (!places || places.length === 0) {
      return NextResponse.json({ departures: [] })
    }

    const stopAreaId = places[0].id // ex: "stop_area:IDFM:71370"

    // 2. Récupérer les départs
    const departuresData = await navitiaFetch(
      `/stop_areas/${encodeURIComponent(stopAreaId)}/departures?count=8&duration=3600`
    )

    const raw = departuresData?.departures ?? []

    // 3. Formater la réponse
    const departures = raw.map((dep: any, i: number) => {
      const line = dep.route?.line ?? {}
      const direction = dep.route?.direction?.stop_point?.name ?? dep.route?.name ?? '—'
      const dt = dep.stop_date_time?.departure_date_time ?? ''
      const baseDt = dep.stop_date_time?.base_departure_date_time ?? dt

      // Format: "20260829T143200" → Date
      const parseNavitiaDate = (s: string) => {
        if (!s || s.length < 15) return new Date()
        return new Date(
          `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(9, 11)}:${s.slice(11, 13)}:${s.slice(13, 15)}`
        )
      }

      const actual = parseNavitiaDate(dt)
      const scheduled = parseNavitiaDate(baseDt)
      const delayMs = actual.getTime() - scheduled.getTime()
      const delayMin = Math.round(delayMs / 60000)

      const hhmm = actual.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })

      const minutesUntil = Math.max(
        0,
        Math.round((actual.getTime() - Date.now()) / 60000)
      )

      // Couleur ligne
      const color = line.color ? `#${line.color}` : '#6b7280'

      return {
        id: `${i}-${line.id}`,
        line: line.code || line.name || '?',
        lineColor: color,
        direction,
        scheduledTime: hhmm,
        minutesUntil,
        delay: delayMin > 0 ? delayMin : 0,
        platform: dep.stop_point?.name ?? '',
        type: getType(line.commercial_mode?.id ?? ''),
        isRealtime: dep.stop_date_time?.data_freshness === 'realtime',
      }
    })

    return NextResponse.json({ departures, stopName: station })
  } catch (err: any) {
    console.error('IDFM API error:', err.message)
    return NextResponse.json(
      { error: 'Impossible de charger les départs', departures: [] },
      { status: 500 }
    )
  }
}

function getType(modeId: string): string {
  if (modeId.includes('metro')) return 'metro'
  if (modeId.includes('rer')) return 'rer'
  if (modeId.includes('train') || modeId.includes('rail')) return 'train'
  if (modeId.includes('bus')) return 'bus'
  if (modeId.includes('tram')) return 'tram'
  return 'train'
}
