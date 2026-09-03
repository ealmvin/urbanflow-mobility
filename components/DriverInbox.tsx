'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import ChatModal from '@/components/ChatModal'

interface Conversation {
  sender_id: string
  sender_name: string
  last_message: string
  last_at: string
  unread: boolean
}

interface Props {
  carpoolId: string
  carpoolLabel: string
  currentUserId: string
  onClose: () => void
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function DriverInbox({ carpoolId, carpoolLabel, currentUserId, onClose }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [openChat, setOpenChat] = useState<Conversation | null>(null)

  const loadConversations = async () => {
    const res = await fetch(`/api/messages?carpool_id=${carpoolId}`)
    const data = await res.json()
    const messages = (data.messages ?? []) as any[]

    // Grouper par sender, exclure les messages du conducteur lui-même
    const map = new Map<string, Conversation>()
    messages
      .filter((m: any) => m.sender_id !== currentUserId)
      .forEach((m: any) => {
        map.set(m.sender_id, {
          sender_id: m.sender_id,
          sender_name: m.sender_name,
          last_message: m.content,
          last_at: m.created_at,
          unread: false,
        })
      })

    setConversations(Array.from(map.values()).reverse())
    setLoading(false)
  }

  useEffect(() => {
    loadConversations()

    // Realtime : mise à jour de la liste quand un nouveau message arrive
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel(`inbox:${carpoolId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'carpool_messages',
        filter: `carpool_id=eq.${carpoolId}`,
      }, (payload) => {
        const msg = payload.new as any
        if (msg.sender_id === currentUserId) return
        setConversations(prev => {
          const updated = prev.filter(c => c.sender_id !== msg.sender_id)
          return [{
            sender_id: msg.sender_id,
            sender_name: msg.sender_name,
            last_message: msg.content,
            last_at: msg.created_at,
            unread: true,
          }, ...updated]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [carpoolId, currentUserId])

  // Si on ouvre un chat → afficher ChatModal
  if (openChat) {
    return (
      <ChatModal
        carpoolId={carpoolId}
        carpoolLabel={`${carpoolLabel} · ${openChat.sender_name}`}
        currentUserId={currentUserId}
        filterUserId={openChat.sender_id}
        onClose={() => setOpenChat(null)}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[3000] flex items-end justify-center sm:items-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: '80vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">📬 Messages reçus</h2>
            <p className="text-xs text-gray-400 truncate max-w-xs">{carpoolLabel}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">✕</button>
        </div>

        {/* Liste conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-400">Chargement...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-14 text-center px-6">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-semibold text-gray-600">Aucun message reçu</p>
              <p className="text-xs text-gray-400 mt-1">Les passagers intéressés vous contacteront ici</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.sender_id}
                onClick={() => setOpenChat(conv)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 border-b border-gray-50 transition text-left"
              >
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {conv.sender_name[0]?.toUpperCase()}
                </div>
                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm ${conv.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                      {conv.sender_name}
                    </p>
                    <span className="text-xs text-gray-400">{fmtTime(conv.last_at)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.last_message}</p>
                </div>
                {conv.unread && (
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                )}
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
