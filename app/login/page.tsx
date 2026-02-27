import { login } from './actions'
import Link from 'next/link'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const params = await searchParams
    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-20 mx-auto font-sans text-foreground">
            <div className="mb-12 text-center">
                <h1 className="text-3xl font-serif text-foreground tracking-tight mb-2">R-dyri</h1>
                <p className="text-sm text-muted-foreground font-light tracking-wide">a calm space for your daily thoughts.</p>
            </div>

            <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1" htmlFor="email">
                    Email
                </label>
                <input
                    className="rounded-lg px-4 py-3 bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary mb-6 transition-all text-foreground"
                    name="email"
                    placeholder="you@example.com"
                    required
                />
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1" htmlFor="password">
                    Password
                </label>
                <input
                    className="rounded-lg px-4 py-3 bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary mb-8 transition-all text-foreground"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                />
                <button
                    formAction={login}
                    className="bg-foreground rounded-lg px-4 py-3 text-background mb-4 font-medium hover:bg-foreground/90 transition-colors"
                >
                    Sign In
                </button>

                <div className="text-center mt-2">
                    <span className="text-sm text-muted-foreground mr-2">Don't have an account?</span>
                    <Link href="/register" className="text-sm font-medium text-primary hover:underline transition-colors">
                        Create one
                    </Link>
                </div>
                {params?.message && (
                    <p className="mt-6 p-4 bg-orange-50 text-orange-800 text-sm text-center rounded-lg">
                        {params.message}
                    </p>
                )}
            </form>
        </div>
    )
}
