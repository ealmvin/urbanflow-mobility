import Link from 'next/link'

export const metadata = {
  title: 'Mentions légales — UrbanFlow',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-green-600 hover:underline mb-6 inline-block">← Retour à l'accueil</Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Mentions légales</h1>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Éditeur</h2>
            <p>UrbanFlow Mobility est un projet pédagogique développé dans le cadre d'une formation professionnelle en développement web.</p>
            <p className="mt-1">Développeuse : Amina Ghoul</p>
            <p>Contact : <a href="mailto:ghoulamina45@gmail.com" className="text-green-600 hover:underline">ghoulamina45@gmail.com</a></p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Hébergement</h2>
            <p>Ce site est hébergé par <strong>Vercel Inc.</strong>, 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
            <p className="mt-1">Les données sont stockées via <strong>Supabase</strong>, hébergé en Europe (région eu-west).</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Propriété intellectuelle</h2>
            <p>L'ensemble du contenu de ce site (code, design, textes) est la propriété de l'éditeur. Les données de transport sont issues de l'API publique IDFM PRIM, sous licence Licence Ouverte v2.0.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Données personnelles</h2>
            <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Consultez notre <Link href="/politique-confidentialite" className="text-green-600 hover:underline">politique de confidentialité</Link> pour plus d'informations.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Cookies</h2>
            <p>Ce site utilise uniquement des cookies fonctionnels nécessaires à l'authentification (session Supabase). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
