import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { score, comment, feature } = await req.json()

  if (!score || score < 1 || score > 5) {
    return NextResponse.json({ error: 'score 1-5 requis' }, { status: 400 })
  }

  const { error } = await supabase.from('user_feedback').insert({
    user_id: user?.id ?? null,
    score,
    comment: comment ?? null,
    feature: feature ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_feedback')
    .select('id, score, comment, feature, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ feedback: data })
}
