import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const carpoolId = req.nextUrl.searchParams.get('carpool_id')
  if (!carpoolId) return NextResponse.json({ messages: [] })

  const { data, error } = await supabase
    .from('carpool_messages')
    .select('id, sender_id, sender_name, content, created_at')
    .eq('carpool_id', carpoolId)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { carpool_id, content } = await req.json()
  if (!carpool_id || !content?.trim()) {
    return NextResponse.json({ error: 'carpool_id et content requis' }, { status: 400 })
  }

  const senderName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur'

  const { data, error } = await supabase.from('carpool_messages').insert({
    carpool_id,
    sender_id: user.id,
    sender_name: senderName,
    content: content.trim(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data })
}
