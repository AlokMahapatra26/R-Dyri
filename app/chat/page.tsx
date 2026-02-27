import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatBox from '../components/ChatBox'

export default async function ChatPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get active partnership
    const { data: partnerships } = await supabase
        .from('partnerships')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .limit(1)

    const activePartnership = partnerships?.[0]
    if (!activePartnership) redirect('/setup')

    const partnerId = activePartnership.user1_id === user.id
        ? activePartnership.user2_id
        : activePartnership.user1_id

    const partnerEmail = activePartnership.user1_id === user.id
        ? activePartnership.user2_email
        : activePartnership.user1_email

    // Fetch partner profile name if available
    let partnerDisplayName = partnerEmail?.split('@')[0] || 'Partner'
    let partnerAvatarUrl: string | null = null
    let currentUserAvatarUrl: string | null = null

    // Fetch both profiles at once
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', [user.id, partnerId].filter(Boolean))

    if (profiles) {
        const partnerProfile = profiles.find(p => p.id === partnerId)
        if (partnerProfile?.name) partnerDisplayName = partnerProfile.name
        if (partnerProfile?.avatar_url) partnerAvatarUrl = partnerProfile.avatar_url

        const userProfile = profiles.find(p => p.id === user.id)
        if (userProfile?.avatar_url) currentUserAvatarUrl = userProfile.avatar_url
    }

    return (
        <div className="flex flex-col h-[100dvh] w-full max-w-xl mx-auto overflow-hidden">
            <header className="w-full py-4 px-6 border-b border-border bg-background/80 backdrop-blur-md shrink-0 z-10">
                <h1 className="font-serif text-xl tracking-tight text-foreground">Chat</h1>
            </header>

            {/* pb-20 accounts for the fixed BottomNav at all screen sizes */}
            <div className="flex-1 w-full overflow-hidden pb-20">
                <ChatBox
                    partnershipId={activePartnership.id}
                    currentUserId={user.id}
                    partnerName={partnerDisplayName}
                    partnerAvatarUrl={partnerAvatarUrl}
                    currentUserAvatarUrl={currentUserAvatarUrl}
                />
            </div>
        </div>
    )
}
