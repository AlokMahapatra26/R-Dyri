'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Settings, Plus } from 'lucide-react'

export default function BottomNav() {
    const pathname = usePathname()

    // Hide bottom nav on specific pages
    if (['/login', '/register', '/setup', '/write'].includes(pathname) || pathname.startsWith('/entry/')) {
        return null
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border pb-safe">
            <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-around relative">
                {/* Feed */}
                <Link
                    href="/"
                    prefetch={true}
                    className={`flex flex-col items-center justify-center w-12 h-12 gap-1 rounded-xl transition-all duration-300 ease-out hover:scale-110 active:scale-95 ${pathname === '/'
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                >
                    <Home size={22} strokeWidth={pathname === '/' ? 2.5 : 2} className={pathname === '/' ? "translate-y-[-1px]" : ""} />
                </Link>

                {/* Center Write Button */}
                <Link
                    href="/write"
                    className="absolute left-1/2 -translate-x-1/2 -top-5 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                    <Plus size={26} strokeWidth={2.5} />
                </Link>

                {/* Settings */}
                <Link
                    href="/settings"
                    prefetch={true}
                    className={`flex flex-col items-center justify-center w-12 h-12 gap-1 rounded-xl transition-all duration-300 ease-out hover:scale-110 active:scale-95 ${pathname === '/settings'
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                >
                    <Settings size={22} strokeWidth={pathname === '/settings' ? 2.5 : 2} className={pathname === '/settings' ? "translate-y-[-1px]" : ""} />
                </Link>
            </div>
        </nav>
    )
}
