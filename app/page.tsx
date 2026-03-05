'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DiaryFeed from './components/DiaryFeed'
import RefreshButton from './components/RefreshButton'

type SessionData = {
  userId: string
  partnerDisplayName: string
  currentUserDisplayName: string
  partnerAvatarUrl: string | null
  currentUserAvatarUrl: string | null
}

export default function Home() {
  const router = useRouter()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAuthAndProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 1. Get active partnership
      const { data: partnerships } = await supabase
        .from('partnerships')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .limit(1)

      const activePartnership = partnerships?.[0]
      if (!activePartnership) {
        router.push('/setup')
        return
      }

      const partnerId = activePartnership.user1_id === user.id
        ? activePartnership.user2_id
        : activePartnership.user1_id

      const partnerEmail = activePartnership.user1_id === user.id
        ? activePartnership.user2_email
        : activePartnership.user1_email

      // Fetch profile names
      let partnerDisplayName = partnerEmail?.split('@')[0] || 'Partner'
      let currentUserDisplayName = user.email?.split('@')[0] || 'You'
      let partnerAvatarUrl: string | null = null
      let currentUserAvatarUrl: string | null = null

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

      setSessionData({
        userId: user.id,
        partnerDisplayName,
        currentUserDisplayName,
        partnerAvatarUrl,
        currentUserAvatarUrl
      })
      setLoading(false)
    }

    fetchAuthAndProfile().catch(() => {
      router.push('/login')
    })
  }, [router])

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin opacity-50" />
      </div>
    )
  }

  if (!sessionData) return null

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-xl mx-auto flex justify-between items-center py-6 px-6 xl:px-0">
        <div className="flex flex-col">
          <h1 className="font-serif text-2xl tracking-tight text-foreground">R-dyri</h1>
          <span className="text-xs text-muted-foreground font-sans tracking-wide mt-0.5 animate-in fade-in">
            {sessionData.currentUserDisplayName} &amp; {sessionData.partnerDisplayName}
          </span>
        </div>

        {/* Refresh Button on the far right */}
        <RefreshButton />
      </header>

      {/* Main Content */}
      <main className="w-full max-w-xl mx-auto flex-1 py-4 px-6 xl:px-0 flex flex-col items-start pb-24">
        <DiaryFeed
          currentUserId={sessionData.userId}
          partnerName={sessionData.partnerDisplayName}
          partnerAvatarUrl={sessionData.partnerAvatarUrl}
          currentUserAvatarUrl={sessionData.currentUserAvatarUrl}
        />
      </main>
    </div>
  )
}
