'use client'

import { useState, useTransition } from 'react'
import { toggleReaction, type Reaction } from './actions'

const EMOJIS = ['❤️', '🔥', '😂', '🥺', '🫂', '✨', '👏']

export function ReactionBar({
    entryId,
    currentUserId,
    initialReactions,
    isOwner,
}: {
    entryId: string
    currentUserId: string
    initialReactions: Reaction[]
    isOwner: boolean
}) {
    const [reactions, setReactions] = useState<Reaction[]>(initialReactions)
    const [isPending, startTransition] = useTransition()

    const myReactions = new Set(
        reactions.filter(r => r.user_id === currentUserId).map(r => r.emoji)
    )

    const emojiCounts = EMOJIS.reduce((acc, emoji) => {
        acc[emoji] = reactions.filter(r => r.emoji === emoji).length
        return acc
    }, {} as Record<string, number>)

    const handleToggle = (emoji: string) => {
        // Optimistic update
        const hasReacted = myReactions.has(emoji)
        if (hasReacted) {
            setReactions(prev => prev.filter(r => !(r.user_id === currentUserId && r.emoji === emoji)))
        } else {
            setReactions(prev => [
                ...prev,
                {
                    id: `optimistic-${Date.now()}`,
                    entry_id: entryId,
                    user_id: currentUserId,
                    emoji,
                    created_at: new Date().toISOString(),
                }
            ])
        }
        startTransition(() => {
            toggleReaction(entryId, emoji)
        })
    }

    // Find the dominant reaction (most used, if any)
    const partnerReactions = reactions.filter(r => r.user_id !== currentUserId)
    const hasPartnerReacted = partnerReactions.length > 0

    return (
        <div className="mt-8">
            {/* Partner acknowledgement */}
            {!isOwner ? (
                <p className="text-xs text-muted-foreground font-sans mb-3 text-center uppercase tracking-widest">
                    Leave a reaction ↓
                </p>
            ) : hasPartnerReacted ? (
                <p className="text-xs text-muted-foreground font-sans mb-3 text-center uppercase tracking-widest">
                    ✓ They reacted to this
                </p>
            ) : (
                <p className="text-xs text-muted-foreground font-sans mb-3 text-center uppercase tracking-widest">
                    Waiting for their reaction...
                </p>
            )}

            {/* Emoji row */}
            <div className="flex justify-center gap-2 flex-wrap">
                {EMOJIS.map((emoji, index) => {
                    const count = emojiCounts[emoji]
                    const iMeReacted = myReactions.has(emoji)
                    const canReact = !isOwner // Only partner can react

                    return (
                        <button
                            key={emoji}
                            disabled={isOwner || isPending}
                            onClick={() => canReact && handleToggle(emoji)}
                            className={`
                                relative flex items-center gap-1 px-3 py-2 rounded-full text-xl transition-all duration-300 ease-out fill-mode-both
                                animate-in zoom-in-75 fade-in
                                ${iMeReacted
                                    ? 'bg-primary/20 border-2 border-primary/50 scale-110 shadow-sm'
                                    : 'bg-card border border-border hover:border-primary/40 hover:bg-muted hover:scale-105 hover:shadow-sm'
                                }
                                ${isOwner ? 'cursor-default opacity-80' : 'cursor-pointer active:scale-90'}
                                ${isPending ? 'opacity-70' : ''}
                            `}
                            style={{ animationDelay: `${index * 50}ms` }}
                            title={isOwner ? "Your partner can react to your entries" : ""}
                        >
                            {emoji}
                            {count > 0 && (
                                <span className="text-xs font-semibold text-muted-foreground ml-0.5 animate-in fade-in zoom-in duration-200">
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
