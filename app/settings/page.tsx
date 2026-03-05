'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ProfileForm from './ProfileForm'
import { ThemeToggle } from './ThemeToggle'
import ExportDiaryButton from './ExportDiaryButton'
import { FontPicker } from './FontPicker'

export default function SettingsPage() {
    const router = useRouter()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSettingsData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/register')
                return
            }

            // Fetch profile data
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            // Fetch active partnership
            const { data: partnerships } = await supabase
                .from('partnerships')
                .select('id')
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                .eq('status', 'accepted')
                .limit(1)

            setData({
                user,
                profile,
                activePartnership: partnerships?.[0] || null
            })
            setLoading(false)
        }

        fetchSettingsData().catch(() => {
            router.push('/register')
        })
    }, [router])

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/register')
    }

    if (loading) {
        return (
            <div className="flex-1 w-full max-w-xl mx-auto flex flex-col h-[100dvh]">
                <header className="w-full py-3 px-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                    <h1 className="font-serif text-lg tracking-tight text-foreground opacity-50">Settings</h1>
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin opacity-50" />
                </div>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="flex-1 w-full max-w-xl mx-auto flex flex-col h-[100dvh]">
            <header className="w-full py-3 px-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                <h1 className="font-serif text-lg tracking-tight text-foreground">Settings</h1>
            </header>
            <main className="flex-1 overflow-y-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <div className="flex flex-col gap-4 p-4">

                    {/* Profile Form (Avatar, Name, Age, Gender) */}
                    <ProfileForm initialData={data.profile} email={data.user.email} />

                    {/* Setting Links */}
                    <div className="flex flex-col gap-2">
                        <ThemeToggle />
                        <FontPicker />
                        <ExportDiaryButton />
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-2 flex gap-2">
                        <button
                            onClick={handleLogout}
                            className="flex-1 h-9 flex items-center justify-center gap-2 bg-transparent border border-border text-muted-foreground rounded-xl text-[13px] font-medium transition-all duration-300 ease-out hover:bg-muted hover:text-foreground hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <LogOut size={16} />
                            Log Out
                        </button>
                    </div>

                </div>
            </main>
        </div>
    )
}
