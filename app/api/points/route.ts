import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const POINT_VALUES: Record<string, number> = {
  view_departures: 5,   // Consulter les départs d'un arrêt
  plan_trip: 20,        // Planifier un itinéraire
  first_trip: 50,       // Premier trajet planifié (bonus)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { action } = await req.json()
  const points = POINT_VALUES[action] ?? 0

  if (points === 0) {
    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  }

  // Upsert — crée la ligne si elle n'existe pas, met à jour sinon
  const { data, error } = await supabase
    .from('user_stats')
    .upsert(
      {
        user_id: user.id,
        points,
        trips_count: action === 'plan_trip' ? 1 : 0,
        co2_saved_kg: action === 'plan_trip' ? 1.2 : 0,
      },
      {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single()

  if (error) {
    // Si upsert ne supporte pas l'incrément, on fait manuellement
    const { data: existing } = await supabase
      .from('user_stats')
      .select('points, trips_count, co2_saved_kg')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      const { data: updated } = await supabase
        .from('user_stats')
        .update({
          points: existing.points + points,
          trips_count: existing.trips_count + (action === 'plan_trip' ? 1 : 0),
          co2_saved_kg: Number(existing.co2_saved_kg) + (action === 'plan_trip' ? 1.2 : 0),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()
      return NextResponse.json({ points: updated?.points ?? 0, earned: points })
    } else {
      // Créer la ligne
      const { data: created } = await supabase
        .from('user_stats')
        .insert({
          user_id: user.id,
          points,
          trips_count: action === 'plan_trip' ? 1 : 0,
          co2_saved_kg: action === 'plan_trip' ? 1.2 : 0,
        })
        .select()
        .single()
      return NextResponse.json({ points: created?.points ?? points, earned: points })
    }
  }

  return NextResponse.json({ points: data?.points ?? points, earned: points })
}
