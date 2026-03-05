'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function RefreshButton() {
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = () => {
        setIsRefreshing(true)
        window.location.reload()
    }

    return (
        <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`
                p-2 rounded-full transition-all duration-300 active:scale-95
                text-muted-foreground hover:text-foreground hover:bg-muted/50
                ${isRefreshing ? 'animate-spin cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
            aria-label="Refresh feed"
        >
            <RefreshCw size={20} strokeWidth={2} />
        </button>
    )
}
