import { PlaySquare } from 'lucide-react'

export default function WatchPage() {
    return (
        <div className="flex-1 w-full max-w-xl mx-auto flex flex-col h-[100dvh]">
            <header className="w-full py-4 px-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                <h1 className="font-serif text-xl tracking-tight text-foreground">Watch Together</h1>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                    <PlaySquare size={32} className="text-muted-foreground" />
                </div>
                <h2 className="font-serif text-2xl text-foreground mb-2">Coming Soon</h2>
                <p className="text-muted-foreground text-[15px] leading-relaxed max-w-sm">
                    A synchronized space to share videos, movies, and moments with your person in real-time.
                </p>
            </main>
        </div>
    )
}
