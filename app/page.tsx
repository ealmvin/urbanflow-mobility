import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'UrbanFlow Mobility — Planifiez vos trajets en Île-de-France',
  description: 'Plateforme de mobilité urbaine intelligente. Combinez métro, RER, Vélib, trottinette et covoiturage en un seul itinéraire optimisé.',
  openGraph: {
    title: 'UrbanFlow Mobility — Mobilité multimodale en IDF',
    description: 'Planifiez vos trajets multimodaux en temps réel. Réduisez votre CO₂ et gagnez des points à chaque déplacement éco-responsable.',
    url: 'https://urbanflow-mobility.vercel.app',
  },
}

const features = [
  {
    icon: '🗺️',
    title: 'Carte temps réel',
    desc: "Visualisez tous les arrêts de transport en commun d'Île-de-France avec les départs en temps réel.",
  },
  {
    icon: '🔀',
    title: 'Planificateur multimodal',
    desc: 'Métro, RER, Vélib, trottinette et covoiturage combinés en un seul itinéraire optimisé.',
  },
  {
    icon: '🏆',
    title: 'Gamification écolo',
    desc: "Points et badges à chaque trajet durable. Suivez votre impact CO₂ en temps réel.",
  },
  {
    icon: '📍',
    title: 'Navigation GPS',
    desc: 'Géolocalisation précise, instructions étape par étape, recalcul automatique de trajet.',
  },
  {
    icon: '🚗',
    title: 'Covoiturage',
    desc: 'Proposez ou rejoignez des trajets entre citoyens. Messagerie temps réel intégrée.',
  },
  {
    icon: '🌿',
    title: 'Empreinte CO₂',
    desc: "Comparez l'impact carbone de chaque mode de transport et suivez vos économies.",
  },
]

const stats = [
  { value: '6', label: 'Modes de transport' },
  { value: 'IDFM', label: 'API officielle IDF' },
  { value: 'ADEME', label: 'Facteurs CO₂ certifiés' },
  { value: '0 €', label: 'Accès gratuit' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <nav
          aria-label="Navigation principale"
          className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4"
        >
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icons/icon-192.png" alt="UrbanFlow logo" width={32} height={32} className="rounded-lg" priority />
            <span className="font-bold text-gray-900 text-base tracking-tight">UrbanFlow</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl transition shadow-sm"
            >
              Créer un compte
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main id="main-content">
        <section
          aria-label="Présentation UrbanFlow"
          className="relative overflow-hidden bg-gradient-to-br from-[#0B1F12] via-[#0f2a18] to-[#0B1F12] text-white px-6 py-28 md:py-36"
        >
          {/* Cercles décoratifs */}
          <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-green-600/10 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-green-500/10 blur-3xl" />

          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              Voyagez malin,<br />
              <span className="text-green-400">réduisez votre CO₂</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Planifiez vos trajets multimodaux en temps réel — métro, RER, Vélib, trottinette,
              covoiturage — et gagnez des points à chaque déplacement éco-responsable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/map"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-2xl text-base transition shadow-lg shadow-green-900/40"
              >
                <span aria-hidden="true">🗺️</span> Explorer la carte
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-base transition backdrop-blur-sm"
              >
                Créer un compte
              </Link>
            </div>

            <p className="text-gray-600 text-sm mt-5">Aucune inscription requise pour explorer la carte</p>
          </div>
        </section>

        {/* Stats */}
        <section aria-label="Chiffres clés" className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            {stats.map((s) => (
              <div key={s.label} className="px-8 py-8 text-center">
                <p className="text-3xl font-black text-gray-900 mb-1">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section aria-labelledby="features-heading" className="py-24 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-4xl font-black text-gray-900 tracking-tight">
              Tout ce qu&apos;il vous faut<br />pour vos trajets
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-green-200 hover:shadow-lg hover:shadow-green-50 transition-all duration-200"
              >
                <div className="mb-4">
                  <span className="text-3xl" aria-hidden="true">{f.icon}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                <div aria-hidden="true" className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-green-400 to-transparent rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section aria-label="Appel à l'action" className="py-24 px-6">
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#0B1F12] to-[#16401f] rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
              Prêt à voyager autrement ?
            </h2>
            <p className="text-gray-400 mb-8 text-base">
              Inscrivez-vous et commencez à planifier vos trajets en 30 secondes.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-10 py-4 rounded-2xl text-base transition shadow-lg shadow-green-900/40"
            >
              Créer un compte →
            </Link>
            <p className="text-gray-600 text-xs mt-5">Données officielles IDF · Aucune carte bancaire requise</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/icons/icon-192.png" alt="UrbanFlow logo" width={24} height={24} className="rounded-md" />
            <span className="text-sm font-semibold text-gray-700">UrbanFlow Mobility</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 UrbanFlow Mobility · Tous droits réservés</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/dashboard/map" className="hover:text-gray-700 transition">Explorer la carte</Link>
            <Link href="/register" className="hover:text-gray-700 transition">S&apos;inscrire</Link>
            <Link href="/login" className="hover:text-gray-700 transition">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
