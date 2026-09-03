import { NextRequest, NextResponse } from 'next/server'

const IDFM_BASE = 'https://prim.iledefrance-mobilites.fr/marketplace/v2/navitia'
const API_KEY = process.env.IDFM_API_KEY!

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q || q.length < 2) return NextResponse.json({ places: [] })

  try {
    const res = await fetch(
      `${IDFM_BASE}/places?q=${encodeURIComponent(q)}&type[]=stop_area&type[]=address&count=6`,
      { headers: { apikey: API_KEY } }
    )
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()

    const places = (data.places ?? []).map((p: any) => {
      const isStop = p.embedded_type === 'stop_area'
      const obj = p.stop_area ?? p.address ?? {}
      const coord = obj.coord ?? {}
      return {
        id: p.id,
        name: p.name,
        type: isStop ? 'stop' : 'address',
        lat: parseFloat(coord.lat ?? '0'),
        lng: parseFloat(coord.lon ?? '0'),
      }
    }).filter((p: any) => p.lat !== 0)

    return NextResponse.json({ places })
  } catch (e) {
    // Fallback Nominatim si IDFM échoue
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=fr`,
        { headers: { 'User-Agent': 'UrbanFlow/1.0' } }
      )
      const data = await res.json()
      const places = data.map((p: any) => ({
        id: p.place_id,
        name: p.display_name.split(',').slice(0, 2).join(', '),
        type: 'address',
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lon),
      }))
      return NextResponse.json({ places })
    } catch {
      return NextResponse.json({ places: [] })
    }
  }
}
