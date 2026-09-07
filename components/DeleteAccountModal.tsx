'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function DeleteAccountModal({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Re-authentifier pour confirmer l'identité
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Mot de passe incorrect. Veuillez réessayer.')
      setLoading(false)
      return
    }

    // 2. Appeler l'API de suppression
    const res = await fetch('/api/delete-account', { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    // 3. Déconnexion et redirection
    await supabase.auth.signOut()
    router.push('/?deleted=1')
  }

  return (
    <>
      {/* Bouton déclencheur */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Supprimer mon compte
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-lg">⚠️</div>
              <div>
                <h2 className="font-bold text-gray-900">Supprimer mon compte</h2>
                <p className="text-xs text-gray-400">Cette action est irréversible</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-xs text-red-700 space-y-1">
              <p className="font-semibold">Ce qui sera supprimé :</p>
              <p>• Votre compte et adresse e-mail</p>
              <p>• Vos points et statistiques CO₂</p>
              <p>• Vos signalements et trajets de covoiturage</p>
            </div>

            <form onSubmit={handleDelete} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Confirmez avec votre mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Votre mot de passe actuel"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setPassword(''); setError('') }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition"
                >
                  {loading ? 'Suppression...' : 'Supprimer définitivement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
