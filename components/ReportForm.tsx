'use client'

import { useState } from 'react'

const REPORT_TYPES = [
  { value: 'voirie', label: '🕳️ Nid de poule / voirie', color: 'bg-orange-100 text-orange-700' },
  { value: 'velo', label: '🚲 Station vélo cassée', color: 'bg-green-100 text-green-700' },
  { value: 'transport', label: '🚇 Problème transport', color: 'bg-blue-100 text-blue-700' },
  { value: 'securite', label: '⚠️ Problème de sécurité', color: 'bg-red-100 text-red-700' },
  { value: 'eclairage', label: '💡 Éclairage défaillant', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'autre', label: '📋 Autre', color: 'bg-gray-100 text-gray-700' },
]

export default function ReportForm({ onClose }: { onClose?: () => void }) {
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!type || !description) return
    setLoading(true)

    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, description, address }),
      })
      // +15 pts pour un signalement
      fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_report' }),
      }).catch(() => {})
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setType('')
        setDescription('')
        setAddress('')
        onClose?.()
      }, 2000)
    } catch {}
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-green-50 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-semibold text-green-800">Signalement envoyé !</p>
        <p className="text-sm text-green-600 mt-1">Merci pour votre contribution citoyenne</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Type de problème</label>
        <div className="grid grid-cols-2 gap-2">
          {REPORT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`text-left text-xs px-3 py-2 rounded-xl border-2 transition ${
                type === t.value
                  ? 'border-green-500 ' + t.color
                  : 'border-gray-100 hover:border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Adresse (optionnel)</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ex: Rue de Rivoli, Paris 4e"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          placeholder="Décrivez le problème en quelques mots..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={!type || !description || loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition"
      >
        {loading ? 'Envoi...' : '📢 Envoyer le signalement'}
      </button>
    </form>
  )
}
