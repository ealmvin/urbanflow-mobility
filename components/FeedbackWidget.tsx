'use client'

import { useState } from 'react'

const FEATURES = [
  { value: 'carte', label: '🗺️ Carte & GPS' },
  { value: 'planificateur', label: '🔍 Planificateur' },
  { value: 'covoiturage', label: '🚗 Covoiturage' },
  { value: 'gamification', label: '🏆 Points & badges' },
  { value: 'signalement', label: '📢 Signalements' },
  { value: 'general', label: '✨ Application générale' },
]

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [feature, setFeature] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!score) return
    setLoading(true)

    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, feature, comment }),
    })

    setDone(true)
    setLoading(false)
    setTimeout(() => { setOpen(false); setDone(false); setScore(null); setFeature(''); setComment('') }, 2000)
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm hover:shadow-md text-sm font-semibold text-gray-700 px-4 py-2.5 rounded-xl transition"
      >
        💬 Donner mon avis
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {done ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">🙏</div>
                <p className="font-bold text-gray-900">Merci pour votre retour !</p>
                <p className="text-sm text-gray-400 mt-1">Votre avis nous aide à améliorer UrbanFlow</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Votre avis compte</h2>
                  <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 text-sm">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Note */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Note globale *</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setScore(n)}
                          className={`flex-1 h-10 rounded-xl text-lg transition ${score === n ? 'bg-green-500 shadow-md scale-110' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                          {['😞', '😕', '😐', '😊', '🤩'][n - 1]}
                        </button>
                      ))}
                    </div>
                    {score && (
                      <p className="text-xs text-center text-gray-400 mt-1">
                        {['Très insatisfait', 'Insatisfait', 'Neutre', 'Satisfait', 'Très satisfait'][score - 1]}
                      </p>
                    )}
                  </div>

                  {/* Fonctionnalité */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Fonctionnalité testée</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FEATURES.map(f => (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => setFeature(f.value)}
                          className={`text-xs px-2 py-1.5 rounded-lg border transition text-left ${feature === f.value ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-gray-100 bg-gray-50 text-gray-600'}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Commentaire */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Commentaire libre</label>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      rows={2}
                      placeholder="Ce qui vous a plu, ce qui peut être amélioré..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!score || loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition"
                  >
                    {loading ? 'Envoi...' : 'Envoyer mon avis'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
