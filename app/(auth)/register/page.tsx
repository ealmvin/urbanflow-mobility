'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-5">
            <svg aria-hidden="true" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Compte créé !</h2>
          <p className="text-gray-500 text-sm">Redirection vers votre tableau de bord…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-[#0B1F12] to-[#16401f] p-12 text-white">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/icons/icon-192.png" alt="UrbanFlow logo" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-lg tracking-tight">UrbanFlow</span>
        </Link>

        <div>
          <h2 className="text-2xl font-black leading-snug mb-4">
            Rejoignez la communauté<br />
            <span className="text-green-400">éco-mobile IDF</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Planifiez, comparez, économisez du CO₂ et gagnez des récompenses à chaque trajet éco-responsable.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {['Inscription en 30 secondes', 'Planificateur multimodal illimité', 'Points & badges à chaque trajet', 'PWA installable sur mobile'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg aria-hidden="true" className="w-2.5 h-2.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
        {/* Logo mobile */}
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <Image src="/icons/icon-192.png" alt="UrbanFlow logo" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-gray-900">UrbanFlow</span>
        </Link>

        <div className="w-full max-w-sm" role="main" id="main-content">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Créer un compte</h1>
            <p className="text-gray-500 text-sm">Inscrivez-vous et planifiez vos premiers trajets en quelques secondes.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nom complet
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                aria-required="true"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-400"
                placeholder="Amina G."
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-required="true"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-400"
                placeholder="vous@exemple.fr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                aria-required="true"
                aria-describedby="pwd-hint"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-400"
                placeholder="••••••••"
              />
              <p id="pwd-hint" className="text-xs text-gray-400 mt-1.5">Minimum 6 caractères</p>
            </div>

            {error && (
              <div role="alert" aria-live="assertive" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <svg aria-hidden="true" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-sm mt-2"
            >
              {loading ? 'Création en cours…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-green-600 font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
