export default function Loading() {
    return (
        <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm text-muted-foreground font-sans tracking-wide">Loading...</p>
            </div>
        </div>
    )
}
