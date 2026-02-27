import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import ImageGallery from './ImageGallery'
import DeleteButton from './DeleteButton'
import { EntryContent } from './EntryContent'
import { getReactionsForEntry } from './actions'
import { ReactionBar } from './ReactionBar'

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const { id } = resolvedParams
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: entry, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !entry) {
        redirect('/')
    }

    const date = new Date(entry.created_at)
    const isMe = entry.user_id === user.id

    const reactions = await getReactionsForEntry(id)

    return (
        <div className="flex-1 w-full flex flex-col items-center max-w-3xl mx-auto px-4 md:px-0 relative font-sans py-8">
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

            <article className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

                <ImageGallery photos={entry.photos || []} />

                <ReactionBar
                    entryId={entry.id}
                    currentUserId={user.id}
                    initialReactions={reactions}
                    isOwner={isMe}
                />
            </article>

            <footer className="w-full text-center mt-24 py-12 border-t border-border text-xs text-muted-foreground font-sans tracking-widest uppercase">
                <p>R-dyri</p>
            </footer>
        </div>
    )
}
