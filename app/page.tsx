'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">UrbanFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-800 transition">
            Connexion
          </Link>
          <Link
            href="/register"
            className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition"
          >
            S'inscrire
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          🌿 Mobilité durable en Île-de-France
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight max-w-2xl mb-4">
          Voyagez malin,<br />
          <span className="text-green-600">réduisez votre CO₂</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mb-10">
          Planifiez vos trajets multimodaux en temps réel — métro, RER, vélo, trottinette, covoiturage — et gagnez des points à chaque déplacement éco-responsable.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/dashboard/map"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3.5 rounded-2xl text-base transition shadow-lg shadow-green-200"
          >
            🗺️ Explorer la carte
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold px-8 py-3.5 rounded-2xl text-base transition"
          >
            Créer un compte gratuit
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">Aucune inscription requise pour explorer</p>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Tout ce qu'il vous faut pour vos trajets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🗺️',
              title: 'Carte temps réel',
              desc: 'Visualisez tous les arrêts de transport en commun d\'Île-de-France. Départs en direct via l\'API IDFM.',
              color: 'bg-blue-50',
            },
            {
              icon: '🔀',
              title: 'Planificateur multimodal',
              desc: 'Combinez métro, RER, Vélib, trottinette Lime et covoiturage BlaBlaCar en un seul itinéraire optimisé.',
              color: 'bg-green-50',
            },
            {
              icon: '🏆',
              title: 'Gamification écolo',
              desc: 'Gagnez des points à chaque trajet durable. Débloquez des badges et suivez votre impact CO₂ économisé.',
              color: 'bg-yellow-50',
            },
            {
              icon: '📍',
              title: 'GPS intégré',
              desc: 'Utilisez votre position GPS comme point de départ. Navigation étape par étape comme Google Maps.',
              color: 'bg-purple-50',
            },
            {
              icon: '🚄',
              title: 'Données SNCF',
              desc: 'Trains, RER et Transilien en temps réel. Horaires officiels Navitia / IDFM.',
              color: 'bg-red-50',
            },
            {
              icon: '🌿',
              title: 'Calcul CO₂',
              desc: 'Facteurs d\'émission certifiés ADEME. Comparez l\'impact de chaque mode de transport.',
              color: 'bg-lime-50',
            },
          ].map((f) => (
            <div key={f.title} className={`${f.color} rounded-2xl p-5`}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-900 text-white px-6 py-14">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '6', label: 'Modes de transport' },
            { value: '100%', label: 'Données temps réel' },
            { value: 'ADEME', label: 'Facteurs CO₂ certifiés' },
            { value: '0 €', label: 'Accès gratuit' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-green-400 mb-1">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Prêt à voyager autrement ?</h2>
        <p className="text-gray-500 mb-8">Inscrivez-vous gratuitement pour débloquer les points et badges.</p>
        <Link
          href="/register"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-10 py-4 rounded-2xl text-base transition shadow-lg shadow-green-200"
        >
          Commencer gratuitement →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-6 text-center text-xs text-gray-400">
        UrbanFlow · Données IDFM PRIM · Navitia · ADEME · © 2026
      </footer>
    </div>
  )
}
