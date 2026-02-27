'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitEntry(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const photosData = formData.get('photos') as string
    const entryId = formData.get('entryId') as string | null
    let photos: string[] = []

    try {
        photos = JSON.parse(photosData)
    } catch (e) {
        // Ignore invalid JSON or empty
    }

    const currentHour = new Date().getHours()
    const logicalDate = new Date()

    // If between midnight and 2 AM, consider it part of the previous day
    if (currentHour >= 0 && currentHour < 2) {
        logicalDate.setDate(logicalDate.getDate() - 1)
    }
    const logicalDateStr = logicalDate.toISOString().split('T')[0]

    if (entryId) {
        // --- EDIT MODE ---
        // Fetch existing entry to check 24-hour limit
        const { data: existingEntry, error: fetchError } = await supabase
            .from('diaries')
            .select('created_at')
            .eq('id', entryId)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !existingEntry) {
            throw new Error("Entry not found or unauthorized.")
        }

        const createdAt = new Date(existingEntry.created_at)
        const now = new Date()
        const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

        if (diffHours > 24) {
            throw new Error("Entries can only be edited within 24 hours of creation.")
        }

        const { error: updateError } = await supabase
            .from('diaries')
            .update({ title, content, photos })
            .eq('id', entryId)
            .eq('user_id', user.id)

        if (updateError) throw new Error(updateError.message)

    } else {
        // --- CREATE MODE ---
        // Check if user already has an entry for this logical date
        const { count } = await supabase
            .from('diaries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('logical_date', logicalDateStr)

        if (count && count > 0) {
            throw new Error("You can only write one entry per day.")
        }

        const { error: insertError } = await supabase.from('diaries').insert({
            user_id: user.id,
            title,
            content,
            photos,
            logical_date: logicalDateStr
        })

        if (insertError) throw new Error(insertError.message)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
