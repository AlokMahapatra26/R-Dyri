import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DiaryFeed from './components/DiaryFeed'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Get active partnership
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

  // Fetch profile names if available
  let partnerDisplayName = partnerEmail?.split('@')[0] || 'Partner'
  let currentUserDisplayName = user.email?.split('@')[0] || 'You'
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
    if (userProfile?.name) currentUserDisplayName = userProfile.name
    if (userProfile?.avatar_url) currentUserAvatarUrl = userProfile.avatar_url
  }

  // 2. Fetch all diary entries with reactions
  const { data: diaryEntries } = await supabase
    .from('diaries')
    .select('*, reactions(emoji, user_id)')
    .order('logical_date', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-xl mx-auto flex justify-between items-center py-6 px-6 xl:px-0">
        <div className="flex flex-col">
          <h1 className="font-serif text-2xl tracking-tight text-foreground">R-dyri</h1>
          <span className="text-xs text-muted-foreground font-sans tracking-wide mt-0.5">
            {currentUserDisplayName} &amp; {partnerDisplayName}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-xl mx-auto flex-1 py-4 px-6 xl:px-0 flex flex-col items-start pb-24">
        <DiaryFeed
          entries={diaryEntries}
          currentUserId={user.id}
          partnerName={partnerDisplayName}
          partnerAvatarUrl={partnerAvatarUrl}
          currentUserAvatarUrl={currentUserAvatarUrl}
        />
      </main>
    </div>
  )
}
