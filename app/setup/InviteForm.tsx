'use client'

import { useActionState } from 'react'
import { invitePartner } from './actions'

type ActionState = { error: string | null }

export default function InviteForm() {
    const [state, formAction, pending] = useActionState<ActionState, FormData>(invitePartner, { error: null })

    return (
        <form action={formAction} className="flex flex-col gap-2 text-foreground">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Partner&apos;s Email
            </label>
            <input
                className="rounded-lg px-4 py-3 bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary mb-2 transition-all text-foreground"
                type="email"
                name="email"
                placeholder="their@email.com"
                required
            />
            {state?.error && (
                <p className="text-sm font-medium text-destructive mb-2 text-center bg-destructive/10 py-2 rounded-lg">
                    {state.error}
                </p>
            )}
            <button
                disabled={pending}
                className="bg-foreground text-background rounded-lg px-4 py-3 font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center mt-2"
            >
                {pending ? "Sending..." : "Send Invitation"}
            </button>
        </form>
    )
}
