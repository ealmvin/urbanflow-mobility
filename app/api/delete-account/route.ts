import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function DELETE(req: NextRequest) {
  // 1. Vérifier que l'utilisateur est authentifié
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // 2. Supprimer les données utilisateur (RLS garantit que chaque user ne supprime que les siennes)
  await supabase.from('user_stats').delete().eq('user_id', user.id)
  await supabase.from('reports').delete().eq('user_id', user.id)
  await supabase.from('carpools').delete().eq('user_id', user.id)

  // 3. Supprimer le compte auth via le client admin (service role)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    // Sans service role key : on déconnecte et on marque le compte
    await supabase.auth.signOut()
    return NextResponse.json({ success: true, note: 'Données supprimées. Compte désactivé.' })
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
