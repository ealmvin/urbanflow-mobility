import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const POINT_VALUES: Record<string, number> = {
  open_map: 5,          // Ouvrir la carte
  view_departures: 5,   // Consulter les départs d'un arrêt
  calculate_route: 10,  // Calculer un itinéraire
  plan_trip: 20,        // Sélectionner et valider un itinéraire
  submit_report: 15,    // Envoyer un signalement
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

  // Récupérer la ligne existante
  const { data: existing } = await supabase
    .from('user_stats')
    .select('points, trips_count, co2_saved_kg')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Incrémenter
    const { data: updated, error: updateError } = await supabase
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

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    return NextResponse.json({ points: updated?.points ?? 0, earned: points })
  } else {
    // Créer la ligne (premier trajet)
    const { data: created, error: insertError } = await supabase
      .from('user_stats')
      .insert({
        user_id: user.id,
        points,
        trips_count: action === 'plan_trip' ? 1 : 0,
        co2_saved_kg: action === 'plan_trip' ? 1.2 : 0,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    return NextResponse.json({ points: created?.points ?? points, earned: points })
  }
}
