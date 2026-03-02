'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function PasswordInput() {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="relative mb-8">
            <input
                className="w-full rounded-lg px-4 py-3 pr-10 bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                required
            />
            <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                onClick={(e) => {
                    e.preventDefault()
                    setShowPassword(!showPassword)
                }}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    )
}
