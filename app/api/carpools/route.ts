import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const from = req.nextUrl.searchParams.get('from')
  const to = req.nextUrl.searchParams.get('to')

  let query = supabase
    .from('carpools')
    .select('*')
    .eq('status', 'active')
    .gt('seats_available', 0)
    .gte('departure_date', new Date().toISOString().split('T')[0])
    .order('departure_date', { ascending: true })
    .order('departure_time', { ascending: true })
    .limit(20)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ carpools: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const {
    from_address, to_address,
    from_lat, from_lng, to_lat, to_lng,
    departure_date, departure_time,
    seats_total, price_per_seat, description,
  } = body

  if (!from_address || !to_address || !departure_date || !departure_time) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  const driverName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Conducteur'

  const { data, error } = await supabase.from('carpools').insert({
    driver_id: user.id,
    driver_name: driverName,
    from_address, to_address,
    from_lat: from_lat ?? null, from_lng: from_lng ?? null,
    to_lat: to_lat ?? null, to_lng: to_lng ?? null,
    departure_date, departure_time,
    seats_total: seats_total ?? 3,
    seats_available: seats_total ?? 3,
    price_per_seat: price_per_seat ?? 5,
    description: description ?? null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ carpool: data })
}
