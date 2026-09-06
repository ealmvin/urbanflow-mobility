import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import Logo from '@/components/Logo'
import Co2Chart from '@/components/Co2Chart'
import ReportForm from '@/components/ReportForm'

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
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Logo href="/" size={32} />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:block font-medium">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-0.5">
            Bonjour, {displayName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-gray-500 text-sm">Tableau de bord · Mobilité multimodale IDF</p>
        </div>

        {/* Badge utilisateur */}
        <div className="bg-gradient-to-br from-[#0B1F12] to-[#16401f] rounded-2xl p-6 mb-6 flex items-center justify-between text-white shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-4xl" aria-hidden="true">{badge.emoji}</span>
            <div>
              <p className="font-black text-lg text-white tracking-tight">{badge.label}</p>
              <p className="text-green-400 text-sm font-semibold">{points} points UrbanFlow</p>
            </div>
          </div>
          {nextBadge && (
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-400 mb-2">Prochain : {nextBadge.next}</p>
              <div className="w-36 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progression vers ${nextBadge?.next} : ${progressPct}%`}
                  className="h-full bg-green-400 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">encore {nextBadge.needed} pts</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Trajets</p>
            <div className="flex items-end gap-1">
              <p className="text-3xl font-black text-gray-900">{tripsCount}</p>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <svg aria-hidden="true" className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-xs text-gray-400">planifiés</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Points</p>
            <p className="text-3xl font-black text-gray-900">{points}</p>
            <div className="mt-2 flex items-center gap-1">
              <svg aria-hidden="true" className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs text-gray-400">UrbanFlow</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">CO₂ évité</p>
            <p className="text-3xl font-black text-gray-900">{Number(co2Saved).toFixed(1)}</p>
            <div className="mt-2 flex items-center gap-1">
              <svg aria-hidden="true" className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
              <span className="text-xs text-gray-400">kg ADEME</span>
            </div>
          </div>
        </div>

        {/* Accès rapide */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href="/dashboard/map"
            className="group flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:border-green-200 hover:shadow-md transition-all"
            aria-label="Planifier un itinéraire multimodal"
          >
            <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center text-xl transition" aria-hidden="true">🗺️</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Planifier</p>
              <p className="text-xs text-gray-400">Itinéraire multimodal</p>
            </div>
          </Link>
          <Link
            href="/dashboard/covoiturage"
            className="group flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:border-orange-200 hover:shadow-md transition-all"
            aria-label="Covoiturage — proposer ou rejoindre un trajet"
          >
            <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-200 rounded-xl flex items-center justify-center text-xl transition" aria-hidden="true">🚗</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Covoiturage</p>
              <p className="text-xs text-gray-400">Proposer / rejoindre</p>
            </div>
          </Link>
        </div>

        {/* Graphique CO₂ */}
        <div className="mb-6">
          <Co2Chart totalCo2={Number(co2Saved)} tripsCount={tripsCount} />
        </div>

        {/* CTA + Signalement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-[#0B1F12] to-[#16401f] rounded-2xl p-7 text-white shadow-lg">
            <h2 className="text-lg font-black tracking-tight mb-1">Planifier un trajet</h2>
            <p className="text-green-400 text-sm mb-5">
              Multimodal · <strong>+20 pts</strong> par trajet
            </p>
            <Link
              href="/dashboard/map"
              className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-md"
            >
              Nouveau trajet →
            </Link>
          </div>

          {/* Signalement */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-black text-gray-900 tracking-tight mb-1">
              <span aria-hidden="true">📢</span> Signaler un problème
            </h2>
            <p className="text-xs text-gray-400 mb-4">Contribuez à améliorer la mobilité urbaine</p>
            <ReportForm />
          </div>
        </div>
      </main>
    </div>
  )
}
