import { signup } from '@/app/login/actions'
import Link from 'next/link'
import { PasswordInput } from '@/app/components/PasswordInput'
import { AuthButton } from '@/app/components/AuthButton'
import { BookOpen } from 'lucide-react'

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const params = await searchParams
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 font-sans text-foreground relative overflow-hidden">

            {/* Subtle background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/[0.02] blur-3xl pointer-events-none" />

            <div className="w-full sm:max-w-md relative z-10">

                {/* Diary-themed header */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
                        <BookOpen size={26} className="text-primary" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-serif text-foreground tracking-tight mb-2">R-dyri</h1>
                    <p className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed">
                        a shared diary for you &amp; your person.
                    </p>
                </div>

                {/* Soft divider */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[11px] text-muted-foreground/60 uppercase tracking-widest font-medium">begin your story</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                <form className="flex flex-col w-full gap-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1" htmlFor="name">
                        Name
                    </label>
                    <input
                        className="rounded-xl px-4 py-3 bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4 transition-all text-foreground placeholder:text-muted-foreground/40"
                        name="name"
                        placeholder="What should we call you?"
                        required
                    />

                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="rounded-xl px-4 py-3 bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4 transition-all text-foreground placeholder:text-muted-foreground/40"
                        name="email"
                        placeholder="you@example.com"
                        required
                    />

                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1" htmlFor="password">
                        Password
                    </label>
                    <PasswordInput />
                    <AuthButton action={signup}>
                        Create Account
                    </AuthButton>

                    <div className="text-center mt-3">
                        <span className="text-sm text-muted-foreground mr-2">Already have an account?</span>
                        <Link href="/login" className="text-sm font-medium text-primary hover:underline transition-colors">
                            Sign in
                        </Link>
                    </div>
                    {params?.message && (
                        <p className="mt-6 p-4 bg-destructive/10 text-destructive text-sm text-center rounded-xl">
                            {params.message}
                        </p>
                    )}
                </form>

                {/* Footer whisper */}
                <p className="text-center text-[11px] text-muted-foreground/40 mt-10 tracking-wide font-serif italic">
                    &ldquo;some things are better written together&rdquo;
                </p>
            </div>
        </div>
    )
}
