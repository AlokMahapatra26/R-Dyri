'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'

type Message = {
    id: string
    content: string
    sender_id: string
    created_at: string
}

export default function ChatBox({
    partnershipId,
    currentUserId,
    partnerName,
    partnerAvatarUrl,
    currentUserAvatarUrl
}: {
    partnershipId: string
    currentUserId: string
    partnerName: string
    partnerAvatarUrl: string | null
    currentUserAvatarUrl: string | null
}) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    const bottomRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        // 1. Fetch initial messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('partnership_id', partnershipId)
                .order('created_at', { ascending: true })
                .limit(50)

            if (data) setMessages(data)
            setLoading(false)
            scrollToBottom()
        }
        fetchMessages()

        // 2. Subscribe to realtime changes
        const channel = supabase.channel(`partnership:${partnershipId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `partnership_id=eq.${partnershipId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message
                    setMessages((prev) => [...prev, newMsg])
                    scrollToBottom()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [partnershipId, supabase])

    const scrollToBottom = () => {
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || sending) return

        setSending(true)
        const content = newMessage.trim()
        setNewMessage('')

        const { error } = await supabase.from('messages').insert({
            partnership_id: partnershipId,
            sender_id: currentUserId,
            content
        })

        if (error) {
            console.error("Failed to send message", error)
        }
        setSending(false)
    }

    return (
        <div className="flex flex-col h-full w-full bg-background overflow-hidden">

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No messages yet. Say hello!</div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId
                        const avatarUrl = isMe ? currentUserAvatarUrl : partnerAvatarUrl
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300 ease-out fill-mode-both`}>
                                {!isMe && (
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-muted overflow-hidden flex items-center justify-center border border-border/50 mt-auto">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="DP" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[13px] font-medium font-serif text-muted-foreground">
                                                {partnerName.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div
                                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[15px] font-sans ${isMe
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-card border border-border text-foreground rounded-bl-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                                {isMe && (
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-muted overflow-hidden flex items-center justify-center border border-border/50 mt-auto">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="DP" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[13px] font-medium font-serif text-muted-foreground">
                                                Y
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSendMessage} className="shrink-0 p-3 bg-card border-t border-border flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-muted border-transparent focus:bg-background focus:border-border focus:ring-0 rounded-full px-4 py-2.5 text-[15px] text-foreground outline-none transition-all"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-[44px] w-[44px] flex items-center justify-center rounded-full disabled:opacity-50 transition-all duration-300 ease-out hover:scale-105 active:scale-95"
                >
                    <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
                </button>
            </form>
        </div>
    )
}
