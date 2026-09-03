'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ChatModal from '@/components/ChatModal'
import DriverInbox from '@/components/DriverInbox'
import { createBrowserClient } from '@supabase/ssr'

interface Carpool {
  id: string
  driver_id: string
  driver_name: string
  from_address: string
  to_address: string
  departure_date: string
  departure_time: string
  seats_available: number
  seats_total: number
  price_per_seat: number
  description?: string
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

function CarpoolCard({
  c, onBook, currentUserId, onChat, onInbox,
}: {
  c: Carpool
  onBook: (id: string) => void
  currentUserId: string | null
  onChat: (c: Carpool) => void
  onInbox: (c: Carpool) => void
}) {
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)

  const handleBook = async () => {
    setBooking(true)
    const res = await fetch(`/api/carpools/${c.id}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seats_booked: 1 }),
    })
    setBooking(false)
    if (res.ok) { setBooked(true); onBook(c.id) }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-900 truncate">{c.from_address}</span>
            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span className="text-sm font-bold text-gray-900 truncate">{c.to_address}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>📅 {formatDate(c.departure_date)}</span>
            <span>🕐 {formatTime(c.departure_time)}</span>
            <span>🚗 {c.driver_name}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <p className="text-lg font-bold text-green-600">{c.price_per_seat} €</p>
          <p className="text-xs text-gray-400">/ place</p>
        </div>
      </div>

      {c.description && (
        <p className="text-xs text-gray-500 mb-3 bg-gray-50 rounded-lg px-3 py-2">{c.description}</p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: c.seats_total }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                i < c.seats_available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'
              }`}
            >
              🧑
            </div>
          ))}
          <span className="text-xs text-gray-400 ml-1">{c.seats_available} place{c.seats_available > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          {currentUserId === c.driver_id ? (
            /* C'est le conducteur — afficher badge + voir messages reçus */
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-3 py-1.5 rounded-xl">
                🚗 Votre trajet
              </span>
              <button
                onClick={() => onInbox(c)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Messages reçus
              </button>
            </div>
          ) : (
            <>
              {/* Bouton message */}
              <button
                onClick={() => onChat(c)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message
              </button>
              {/* Bouton réserver */}
              <button
                onClick={handleBook}
                disabled={booking || booked || c.seats_available === 0}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  booked
                    ? 'bg-green-100 text-green-700'
                    : c.seats_available === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {booked ? '✓ Réservé' : booking ? '...' : 'Réserver'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    from_address: '', to_address: '',
    departure_date: '', departure_time: '',
    seats_total: 3, price_per_seat: 5, description: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/carpools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) {
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onCreated() }, 1500)
    }
  }

  if (success) return (
    <div className="text-center py-8">
      <div className="text-4xl mb-2">✅</div>
      <p className="font-semibold text-green-800">Trajet publié !</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Départ *</label>
          <input required value={form.from_address} onChange={e => set('from_address', e.target.value)}
            placeholder="Ex: Gare de Lyon, Paris"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Arrivée *</label>
          <input required value={form.to_address} onChange={e => set('to_address', e.target.value)}
            placeholder="Ex: Versailles"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Date *</label>
          <input required type="date" value={form.departure_date} min={new Date().toISOString().split('T')[0]}
            onChange={e => set('departure_date', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Heure *</label>
          <input required type="time" value={form.departure_time}
            onChange={e => set('departure_time', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Places disponibles</label>
          <select value={form.seats_total} onChange={e => set('seats_total', Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400">
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} place{n>1?'s':''}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Prix / place (€)</label>
          <input type="number" min="0" step="0.5" value={form.price_per_seat}
            onChange={e => set('price_per_seat', Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Message (optionnel)</label>
        <input value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Ex: Autoroute A6, pas de détour possible"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition">
        {loading ? 'Publication...' : '🚗 Publier mon trajet'}
      </button>
    </form>
  )
}

export default function CovoituragePage() {
  const [carpools, setCarpools] = useState<Carpool[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'search' | 'create'>('search')
  const [chatCarpool, setChatCarpool] = useState<Carpool | null>(null)
  const [inboxCarpool, setInboxCarpool] = useState<Carpool | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
  }, [])

  const load = () => {
    setLoading(true)
    fetch('/api/carpools')
      .then(r => r.json())
      .then(d => { setCarpools(d.carpools ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Chat passager */}
      {chatCarpool && (
        <ChatModal
          carpoolId={chatCarpool.id}
          carpoolLabel={`${chatCarpool.from_address} → ${chatCarpool.to_address}`}
          currentUserId={currentUserId}
          onClose={() => setChatCarpool(null)}
        />
      )}

      {/* Boîte de réception conducteur */}
      {inboxCarpool && currentUserId && (
        <DriverInbox
          carpoolId={inboxCarpool.id}
          carpoolLabel={`${inboxCarpool.from_address} → ${inboxCarpool.to_address}`}
          currentUserId={currentUserId}
          onClose={() => setInboxCarpool(null)}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">🚗</span>
        </div>
        <h1 className="font-bold text-gray-900">Covoiturage UrbanFlow</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6">
          <button onClick={() => setTab('search')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${tab === 'search' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
            🔍 Trajets disponibles
          </button>
          <button onClick={() => setTab('create')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${tab === 'create' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
            ➕ Proposer un trajet
          </button>
        </div>

        {tab === 'search' && (
          <div className="space-y-3">
            {loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">Chargement des trajets...</p>
              </div>
            ) : carpools.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-4xl mb-3">🚗</p>
                <p className="font-semibold text-gray-600">Aucun trajet disponible</p>
                <p className="text-sm text-gray-400 mt-1">Soyez le premier à proposer un trajet !</p>
                <button onClick={() => setTab('create')}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition">
                  Proposer un trajet
                </button>
              </div>
            ) : (
              carpools.map(c => (
                <CarpoolCard
                  key={c.id}
                  c={c}
                  onBook={load}
                  currentUserId={currentUserId}
                  onChat={(carpool) => setChatCarpool(carpool)}
                  onInbox={(carpool) => setInboxCarpool(carpool)}
                />
              ))
            )}
          </div>
        )}

        {tab === 'create' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-1">Proposer un trajet</h2>
            <p className="text-xs text-gray-400 mb-4">Partagez votre trajet et réduisez votre empreinte CO₂</p>
            <CreateForm onCreated={() => { load(); setTab('search') }} />
          </div>
        )}
      </div>
    </div>
  )
}
