'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteEntry(entryId: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('You must be logged in')
    }

    const { data, error } = await supabase
        .from('diaries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id)
        .select()

    if (error) {
        console.error("Error deleting entry:", error)
        return { success: false, error: 'Failed to delete entry' }
    }

    if (!data || data.length === 0) {
        console.warn("Delete affected 0 rows - likely an RLS policy preventing DELETE for authorized users.")
        return { success: false, error: 'Database blocked deletion. You likely need to add a "DELETE" RLS policy to the "diaries" table in Supabase.' }
    }

    revalidatePath('/')
    return { success: true }
}

export type Reaction = {
    id: string
    entry_id: string
    user_id: string
    emoji: string
    created_at: string
}

export async function toggleReaction(entryId: string, emoji: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Check if the reaction already exists for this user and emoji
    const { data: existing } = await supabase
        .from('reactions')
        .select('id')
        .eq('entry_id', entryId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single()

    if (existing) {
        await supabase.from('reactions').delete().eq('id', existing.id)
    } else {
        await supabase.from('reactions').insert({ entry_id: entryId, user_id: user.id, emoji })
    }

    revalidatePath(`/entry/${entryId}`)
}

export async function getReactionsForEntry(entryId: string): Promise<Reaction[]> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('reactions')
        .select('*')
        .eq('entry_id', entryId)
    return (data as Reaction[]) || []
}
