import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await req.json()
  const { type, description, lat, lng, address } = body

  if (!type || !description) {
    return NextResponse.json({ error: 'type et description requis' }, { status: 400 })
  }

  const { data, error } = await supabase.from('reports').insert({
    user_id: user?.id ?? null,
    type,
    description,
    lat: lat ?? null,
    lng: lng ?? null,
    address: address ?? null,
    status: 'open',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ report: data })
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reports')
    .select('id, type, description, address, status, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data })
}
