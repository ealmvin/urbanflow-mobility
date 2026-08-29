import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

function getBadge(points: number) {
  if (points >= 1000) return { label: 'Champion UrbanFlow', emoji: '⭐', color: 'text-yellow-600', bg: 'bg-yellow-50' }
  if (points >= 500)  return { label: 'Citoyen Mobilisé', emoji: '🏆', color: 'text-purple-600', bg: 'bg-purple-50' }
  if (points >= 100)  return { label: 'Explorateur Urbain', emoji: '🚇', color: 'text-blue-600', bg: 'bg-blue-50' }
  return { label: 'Voyageur Débutant', emoji: '🌱', color: 'text-green-600', bg: 'bg-green-50' }
}

function getNextBadge(points: number) {
  if (points < 100) return { next: 'Explorateur Urbain', needed: 100 - points }
  if (points < 500) return { next: 'Citoyen Mobilisé', needed: 500 - points }
  if (points < 1000) return { next: 'Champion UrbanFlow', needed: 1000 - points }
  return null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Récupérer les stats de l'utilisateur
  const { data: stats } = await supabase
    .from('user_stats')
    .select('points, trips_count, co2_saved_kg')
    .eq('user_id', user.id)
    .single()

  const points = stats?.points ?? 0
  const tripsCount = stats?.trips_count ?? 0
  const co2Saved = stats?.co2_saved_kg ?? 0
  const badge = getBadge(points)
  const nextBadge = getNextBadge(points)
  const progressPct = nextBadge
    ? Math.round(((points % (points < 100 ? 100 : points < 500 ? 500 : 1000)) / (points < 100 ? 100 : points < 500 ? 400 : 500)) * 100)
    : 100

  const displayName = user.user_metadata?.full_name || user.email

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">UrbanFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Bonjour, {displayName} 👋
        </h1>
        <p className="text-gray-500 mb-6">Planifiez vos trajets multimodaux</p>

        {/* Badge utilisateur */}
        <div className={`${badge.bg} rounded-2xl p-5 mb-6 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{badge.emoji}</span>
            <div>
              <p className={`font-bold text-lg ${badge.color}`}>{badge.label}</p>
              <p className="text-sm text-gray-500">{points} points UrbanFlow</p>
            </div>
          </div>
          {nextBadge && (
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-400 mb-1">Prochain badge : {nextBadge.next}</p>
              <div className="w-32 h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">encore {nextBadge.needed} pts</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">Trajets planifiés</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{tripsCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">Points UrbanFlow</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{points}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">CO₂ économisé</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{Number(co2Saved).toFixed(1)} kg</p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-8 text-white">
          <h2 className="text-xl font-bold mb-2">Planifier un trajet</h2>
          <p className="text-green-100 mb-4">
            Trouvez le meilleur itinéraire multimodal · Gagnez <strong>20 pts</strong> par trajet planifié
          </p>
          <Link
            href="/dashboard/map"
            className="inline-block bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition"
          >
            Nouveau trajet →
          </Link>
        </div>
      </main>
    </div>
  )
}
