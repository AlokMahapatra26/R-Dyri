'use client'

import { useFormStatus } from 'react-dom'

export function AuthButton({
    action,
    children
}: {
    action: (payload: FormData) => void,
    children: React.ReactNode
}) {
    const { pending } = useFormStatus()

    return (
        <button
            formAction={action}
            disabled={pending}
            className={`
                bg-foreground rounded-lg px-4 py-3 text-background mb-4 font-medium 
                transition-all duration-300 ease-out flex items-center justify-center gap-2
                ${pending ? 'opacity-70 cursor-not-allowed scale-[0.98]' : 'hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg'}
            `}
        >
            {pending && (
                <div className="w-4 h-4 rounded-full border-2 border-background/30 border-t-background animate-spin" />
            )}
            {children}
        </button>
    )
}
