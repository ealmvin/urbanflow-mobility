import Link from 'next/link'

export const metadata = {
  title: 'Politique de confidentialité — UrbanFlow',
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-green-600 hover:underline mb-6 inline-block">← Retour à l'accueil</Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
        <p className="text-xs text-gray-400 mb-8">Dernière mise à jour : septembre 2026</p>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">1. Données collectées</h2>
            <p>Lors de votre inscription, nous collectons :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Votre adresse e-mail (identifiant de connexion)</li>
              <li>Un mot de passe chiffré (jamais stocké en clair)</li>
            </ul>
            <p className="mt-2">Lors de l'utilisation de l'application, nous stockons :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Vos trajets planifiés et points de gamification</li>
              <li>Vos signalements citoyens (description, type, adresse optionnelle)</li>
              <li>Vos publications de covoiturage (départ, destination, date)</li>
            </ul>
            <p className="mt-2">Nous ne collectons <strong>pas</strong> de données de localisation en temps réel ni de données de navigation.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">2. Finalité du traitement</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fournir et personnaliser les fonctionnalités de l'application</li>
              <li>Afficher vos statistiques de mobilité (CO2, points)</li>
              <li>Permettre les fonctionnalités de covoiturage et de signalement</li>
            </ul>
            <p className="mt-2">Vos données ne sont <strong>jamais vendues</strong> à des tiers et ne sont pas utilisées à des fins publicitaires.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">3. Base légale</h2>
            <p>Le traitement est fondé sur l'exécution du contrat (CGU) que vous acceptez lors de votre inscription (article 6.1.b du RGPD).</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">4. Durée de conservation</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Compte utilisateur : jusqu'à suppression de votre compte</li>
              <li>Signalements : 24 heures (suppression automatique)</li>
              <li>Trajets de covoiturage expirés : supprimés après la date de trajet</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">5. Vos droits (RGPD)</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Accès</strong> : consulter vos données personnelles</li>
              <li><strong>Rectification</strong> : corriger des informations inexactes</li>
              <li><strong>Suppression</strong> : demander l'effacement de votre compte et vos données</li>
              <li><strong>Portabilité</strong> : recevoir vos données dans un format lisible</li>
              <li><strong>Opposition</strong> : vous opposer à certains traitements</li>
            </ul>
            <p className="mt-2">Pour exercer ces droits : <a href="mailto:ghoulamina45@gmail.com" className="text-green-600 hover:underline">ghoulamina45@gmail.com</a></p>
            <p className="mt-1">Vous pouvez également contacter la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">CNIL</a> en cas de litige.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">6. Sécurité</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Chiffrement des données en transit (HTTPS)</li>
              <li>Authentification par JWT via Supabase Auth</li>
              <li>Row Level Security : chaque utilisateur accède uniquement à ses propres données</li>
              <li>Mots de passe hashés (bcrypt via Supabase)</li>
              <li>Hébergement en Europe (Supabase eu-west)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">7. Cookies</h2>
            <p>Un seul cookie est utilisé : le cookie de session Supabase, strictement nécessaire au fonctionnement de l'authentification. Il n'existe aucun cookie publicitaire ou de tracking.</p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link href="/mentions-legales" className="text-xs text-gray-400 hover:underline">Mentions légales</Link>
        </div>
      </div>
    </div>
  )
}
