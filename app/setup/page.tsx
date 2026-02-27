import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { acceptInvitation } from './actions'
import { LogOut } from 'lucide-react'
import InviteForm from './InviteForm'

export default async function SetupPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const userEmail = user.email

    // Find if user has an active or pending partnership
    const { data: partnerships } = await supabase
        .from('partnerships')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id},user2_email.eq.${userEmail}`)

    const activePartnership = partnerships?.find(p => p.status === 'accepted')

    if (activePartnership) {
        redirect('/') // Already set up
    }

    const pendingSent = partnerships?.find(p => p.user1_id === user.id && p.status === 'pending')
    const pendingReceived = partnerships?.find(p => p.user2_email?.toLowerCase() === userEmail?.toLowerCase() && p.status === 'pending')

    return (
        <div className="flex-1 w-full flex flex-col items-center justify-center max-w-md mx-auto px-6 py-12 relative font-sans">
            <div className="absolute top-6 right-6">
                <form action={async () => {
                    'use server'
                    const { createClient } = await import('@/lib/supabase/server')
                    const supabase = await createClient()
                    await supabase.auth.signOut()
                    redirect('/login')
                }}>
                    <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <LogOut size={16} /> Logout
                    </button>
                </form>
            </div>

            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-serif text-foreground tracking-tight mb-2">R-dyri partner</h1>
                    <p className="text-sm text-muted-foreground font-light tracking-wide">connect with your person.</p>
                </div>

                {pendingReceived ? (
                    <div className="bg-card border border-border rounded-2xl p-8 mb-8 text-center text-foreground">
                        <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-4 animate-pulse" />
                        <h2 className="font-serif text-xl text-foreground mb-2">Invitation received</h2>
                        <p className="text-sm text-muted-foreground mb-8">
                            Someone has invited you to share a diary workspace.
                        </p>
                        <form action={async () => {
                            "use server"
                            await acceptInvitation(pendingReceived.id)
                        }}>
                            <button className="w-full bg-foreground text-background rounded-lg px-4 py-3 font-medium hover:bg-foreground/90 transition-colors">
                                Accept Invitation
                            </button>
                        </form>
                    </div>
                ) : pendingSent ? (
                    <div className="bg-card border border-border rounded-2xl p-8 mb-8 text-center text-foreground">
                        <h2 className="font-serif text-xl text-foreground mb-2">Waiting for partner</h2>
                        <p className="text-sm text-muted-foreground mb-8">
                            You invited <span className="font-medium text-foreground">{pendingSent.user2_email}</span>. They need to create an account and accept the invitation.
                        </p>
                        <form action={async () => {
                            "use server"
                            const { cancelInvitation } = await import('./actions')
                            await cancelInvitation(pendingSent.id)
                        }}>
                            <button className="w-full bg-transparent border border-muted text-muted-foreground rounded-lg px-4 py-3 font-medium hover:bg-muted hover:text-destructive hover:border-destructive/30 transition-colors">
                                Cancel Invitation
                            </button>
                        </form>
                    </div>
                ) : (
                    <InviteForm />
                )}
            </div>
        </div>
    )
}
