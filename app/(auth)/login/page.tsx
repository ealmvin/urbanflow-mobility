'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
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
          <blockquote className="text-2xl font-bold leading-snug text-white mb-4">
            "Chaque trajet éco-responsable est un pas vers une ville plus respirable."
          </blockquote>
          <p className="text-green-400 text-sm font-medium">UrbanFlow Mobility · Île-de-France</p>
        </div>

        <div className="flex flex-col gap-3">
          {['Données IDFM PRIM officielles', 'CO₂ certifié ADEME', 'PWA installable', 'RGPD compliant'].map((item) => (
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
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Bon retour !</h1>
            <p className="text-gray-500 text-sm">Connectez-vous à votre compte UrbanFlow.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Mot de passe
                </label>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-required="true"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition placeholder-gray-400"
                placeholder="••••••••"
              />
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
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-green-600 font-semibold hover:underline">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
