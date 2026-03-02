import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { acceptInvitation } from './actions'
import { LogOut, BookOpen, Send, Clock, Sparkles } from 'lucide-react'
import InviteForm from './InviteForm'

export default async function SetupPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/register')

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
        <div className="min-h-screen flex flex-col items-center justify-center px-6 font-sans text-foreground relative overflow-hidden">

            {/* Subtle background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />

            {/* Logout button */}
            <div className="absolute top-6 right-6 z-20">
                <form action={async () => {
                    'use server'
                    const { createClient } = await import('@/lib/supabase/server')
                    const supabase = await createClient()
                    await supabase.auth.signOut()
                    redirect('/register')
                }}>
                    <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer">
                        <LogOut size={16} /> Logout
                    </button>
                </form>
            </div>

            <div className="w-full max-w-md relative z-10">

                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
                        <BookOpen size={26} className="text-primary" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-serif text-foreground tracking-tight mb-2">Connect your partner</h1>
                    <p className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed max-w-xs mx-auto">
                        R-dyri is a shared diary. Invite your partner so you can both write and read each other&apos;s entries.
                    </p>
                </div>

                {pendingReceived ? (
                    <div className="bg-card border border-border rounded-2xl p-8 mb-8 text-center text-foreground">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                            <Sparkles size={22} className="text-primary" />
                        </div>
                        <h2 className="font-serif text-xl text-foreground mb-2">You&apos;ve been invited!</h2>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            Someone special wants to share a diary with you. Accept to start writing together.
                        </p>
                        <form action={async () => {
                            "use server"
                            await acceptInvitation(pendingReceived.id)
                        }}>
                            <button className="w-full bg-foreground text-background rounded-xl px-4 py-3 font-medium hover:bg-foreground/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                                Accept &amp; Start Writing Together
                            </button>
                        </form>
                    </div>
                ) : pendingSent ? (
                    <div className="bg-card border border-border rounded-2xl p-8 mb-8 text-center text-foreground">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                            <Clock size={22} className="text-muted-foreground animate-pulse" />
                        </div>
                        <h2 className="font-serif text-xl text-foreground mb-2">Waiting for your partner</h2>
                        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                            You&apos;ve invited <span className="font-medium text-foreground">{pendingSent.user2_email}</span>
                        </p>
                        <p className="text-xs text-muted-foreground/60 mb-6 leading-relaxed">
                            They need to create an account with this email and accept the invitation. Share this app link with them!
                        </p>
                        <form action={async () => {
                            "use server"
                            const { cancelInvitation } = await import('./actions')
                            await cancelInvitation(pendingSent.id)
                        }}>
                            <button className="w-full bg-transparent border border-border text-muted-foreground rounded-xl px-4 py-3 font-medium hover:bg-muted hover:text-destructive hover:border-destructive/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                                Cancel Invitation
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        {/* How it works — before the form */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-[11px] text-muted-foreground/60 uppercase tracking-widest font-medium">how it works</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        <div className="grid grid-cols-1 gap-3 mb-8">
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-0.5">1</div>
                                <p className="text-muted-foreground"><span className="text-foreground font-medium">Enter your partner&apos;s email</span> below to send them an invite.</p>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-0.5">2</div>
                                <p className="text-muted-foreground"><span className="text-foreground font-medium">They create an account</span> using that same email.</p>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-0.5">3</div>
                                <p className="text-muted-foreground"><span className="text-foreground font-medium">They accept the invite</span> and you both can start writing!</p>
                            </div>
                        </div>

                        <InviteForm />
                    </>
                )}

                {/* Footer whisper */}
                <p className="text-center text-[11px] text-muted-foreground/40 mt-8 tracking-wide font-serif italic">
                    &ldquo;every great story has two sides&rdquo;
                </p>
            </div>
        </div>
    )
}
