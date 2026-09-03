'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Message {
  id: string
  sender_id: string
  sender_name: string
  content: string
  created_at: string
}

interface Props {
  carpoolId: string
  carpoolLabel: string
  currentUserId: string | null
  filterUserId?: string  // conducteur : filtrer sur un passager précis
  onClose: () => void
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatModal({ carpoolId, carpoolLabel, currentUserId, filterUserId, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Charger les messages initiaux
  useEffect(() => {
    fetch(`/api/messages?carpool_id=${carpoolId}`)
      .then(r => r.json())
      .then(d => {
        let msgs = d.messages ?? []
        // Conducteur : ne montrer que les messages du passager sélectionné + ses propres réponses
        if (filterUserId) {
          msgs = msgs.filter((m: Message) => m.sender_id === filterUserId || m.sender_id === currentUserId)
        }
        setMessages(msgs)
      })
    inputRef.current?.focus()
  }, [carpoolId])

  // Supabase Realtime — WebSocket
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel(`chat:${carpoolId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'carpool_messages',
          filter: `carpool_id=eq.${carpoolId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          // Filtrer si conducteur
          if (filterUserId && msg.sender_id !== filterUserId && msg.sender_id !== currentUserId) return
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [carpoolId])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    if (!currentUserId) {
      alert('Connectez-vous pour envoyer un message')
      return
    }
    setSending(true)
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carpool_id: carpoolId, content: input.trim() }),
    })
    setInput('')
    setSending(false)
    inputRef.current?.focus()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
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
            <h2 className="font-bold text-gray-900 text-sm">💬 Discussion</h2>
            <p className="text-xs text-gray-400 truncate max-w-xs">{carpoolLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-400">{connected ? 'Connecté' : 'Connexion...'}</span>
            <button onClick={onClose} className="ml-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">✕</button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm text-gray-400">Aucun message pour l'instant</p>
              <p className="text-xs text-gray-300 mt-1">Posez vos questions au conducteur</p>
            </div>
          )}
          {messages.map((m) => {
            const isMe = m.sender_id === currentUserId
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isMe && (
                    <span className="text-xs text-gray-400 mb-0.5 px-1">{m.sender_name}</span>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-green-600 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-xs text-gray-300 mt-0.5 px-1">{fmtTime(m.created_at)}</span>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
          {!currentUserId ? (
            <p className="text-xs text-gray-400 text-center w-full">
              <a href="/login" className="text-green-600 font-semibold">Connectez-vous</a> pour envoyer un message
            </p>
          ) : (
            <>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Votre message…"
                className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-green-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:opacity-40 rounded-2xl flex items-center justify-center text-white transition flex-shrink-0"
              >
                <svg className="w-4 h-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
