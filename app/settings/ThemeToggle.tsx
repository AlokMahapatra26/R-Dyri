"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Wait until mounted on client to render theme-specific content
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="flex items-center justify-between w-full px-4 py-3 bg-card border border-border rounded-xl transition-colors">
                <span className="text-sm font-medium text-foreground">
                    Appearance
                </span>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-0">
                        Theme
                    </span>
                    <div className="w-[18px] h-[18px]" />
                </div>
            </button>
        )
    }

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="flex items-center justify-between w-full px-4 py-3 bg-card border border-border rounded-xl hover:bg-muted transition-colors"
        >
            <span className="text-sm font-medium text-foreground">
                Appearance
            </span>
            <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs uppercase tracking-wider font-semibold">
                    {theme === "light" ? "Light" : "Dark"}
                </span>
                {theme === "light" ? (
                    <Sun size={18} />
                ) : (
                    <Moon size={18} />
                )}
            </div>
        </button>
    )
}
