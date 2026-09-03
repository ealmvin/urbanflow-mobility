import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { seats_booked = 1 } = await req.json()

  // Vérifier places dispo
  const { data: carpool } = await supabase
    .from('carpools')
    .select('seats_available, driver_id, driver_name, from_address, to_address')
    .eq('id', id)
    .single()

  if (!carpool) return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 })
  if (carpool.driver_id === user.id) return NextResponse.json({ error: 'Vous êtes le conducteur' }, { status: 400 })
  if (carpool.seats_available < seats_booked) return NextResponse.json({ error: 'Plus de places disponibles' }, { status: 400 })

  const passengerName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Passager'

  // Créer la réservation
  const { error: bookError } = await supabase.from('carpool_bookings').insert({
    carpool_id: id,
    passenger_id: user.id,
    passenger_name: passengerName,
    seats_booked,
  })
  if (bookError) return NextResponse.json({ error: bookError.message }, { status: 500 })

  // Décrémenter les places
  await supabase.from('carpools').update({
    seats_available: carpool.seats_available - seats_booked,
  }).eq('id', id)

  // Bonus points
  await supabase.from('user_stats').upsert(
    { user_id: user.id, points: 15 },
    { onConflict: 'user_id' }
  )

  return NextResponse.json({ success: true })
}
