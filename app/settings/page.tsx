import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import ProfileForm from './ProfileForm'
import DeleteChatButton from './DeleteChatButton'
import { deleteAllChatMessages } from './actions'
import { ThemeToggle } from './ThemeToggle'
import ExportDiaryButton from './ExportDiaryButton'
import { FontPicker } from './FontPicker'

export default async function SettingsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
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

    const activePartnership = partnerships?.[0]

    return (
        <div className="flex-1 w-full max-w-xl mx-auto flex flex-col h-[100dvh]">
            <header className="w-full py-3 px-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                <h1 className="font-serif text-lg tracking-tight text-foreground">Settings</h1>
            </header>
            <main className="flex-1 overflow-y-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <div className="flex flex-col gap-4 p-4">

                    {/* Profile Form (Avatar, Name, Age, Gender) */}
                    <ProfileForm initialData={profile} email={user.email} />

                    {/* Setting Links */}
                    <div className="flex flex-col gap-2">
                        <ThemeToggle />
                        <FontPicker />
                        <ExportDiaryButton />
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-2 flex gap-2">
                        {activePartnership && (
                            <div className="flex-1">
                                <DeleteChatButton action={deleteAllChatMessages} />
                            </div>
                        )}
                        <form className="flex-1" action={async () => {
                            'use server'
                            const { createClient } = await import('@/lib/supabase/server')
                            const supabase = await createClient()
                            await supabase.auth.signOut()
                            redirect('/login')
                        }}>
                            <button className="h-9 w-full flex items-center justify-center gap-2 bg-transparent border border-border text-muted-foreground rounded-xl text-[13px] font-medium transition-all duration-300 ease-out hover:bg-muted hover:text-foreground hover:scale-[1.02] active:scale-[0.98]">
                                <LogOut size={16} />
                                Log Out
                            </button>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    )
}
