'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import DeleteButton from './DeleteButton'
import { EntryContent } from './EntryContent'
import { ReactionBar } from './ReactionBar'

export default function EntryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchEntryData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/register')
                return
            }

            const { data: entry, error: entryError } = await supabase
                .from('diaries')
                .select('*')
                .eq('id', id)
                .single()

            if (entryError || !entry) {
                router.push('/')
                return
            }

            const { data: reactions } = await supabase
                .from('reactions')
                .select('*')
                .eq('entry_id', id)

            setData({
                user,
                entry,
                reactions: reactions || []
            })
            setIsLoading(false)
        }

        fetchEntryData().catch(() => {
            router.push('/')
        })
    }, [id, router])

    if (isLoading) {
        return (
            <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin opacity-50" />
            </div>
        )
    }

    if (!data) return null

    const { entry, user, reactions } = data
    const date = new Date(entry.created_at)
    const isMe = entry.user_id === user.id

    return (
        <div className="flex-1 w-full flex flex-col items-center max-w-3xl mx-auto px-6 md:px-10 relative font-sans py-8 diary-paper min-h-screen">
            <header className="w-full flex justify-between items-center mb-12">
                <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors gap-1 text-sm font-medium">
                    <ChevronLeft size={16} /> Back
                </Link>
                <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="opacity-70" />
                        <span className="text-xs uppercase tracking-widest font-medium">
                            {format(date, 'MMM d, yyyy')}
                        </span>
                    </div>
                    {isMe && <DeleteButton entryId={entry.id} />}
                </div>
            </header>

            <article className="w-full flex flex-col gap-4">
                <header className="flex flex-col gap-4">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-sans">
                        {format(date, 'EEEE, MMMM do')}
                    </span>
                </header>

                <EntryContent
                    title={entry.title}
                    content={entry.content}
                    fallbackTitle={format(date, 'MMMM do, yyyy')}
                />

                <ReactionBar
                    entryId={entry.id}
                    currentUserId={user.id}
                    initialReactions={reactions}
                    isOwner={isMe}
                />
            </article>

            <footer className="w-full text-center mt-24 py-12 border-t border-border/30 text-xs text-muted-foreground font-serif tracking-widest italic">
                <p>R-dyri</p>
            </footer>
        </div>
    )
}
