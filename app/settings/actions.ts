'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteAllChatMessages() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Not logged in' }
    }

    // Fetch active partnership
    const { data: partnerships } = await supabase
        .from('partnerships')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .limit(1)

    const activePartnership = partnerships?.[0]
    if (!activePartnership) {
        return { success: false, error: 'No active partnership found' }
    }

    const { data, error } = await supabase
        .from('messages')
        .delete()
        .eq('partnership_id', activePartnership.id)
        .select() // need .select() to get the deleted rows and know if RLS blocked it

    if (error) {
        console.error("Delete error:", error)
        return { success: false, error: error.message }
    }

    if (!data || data.length === 0) {
        // Did it actually find 0 messages to begin with, or did RLS block it?
        // Let's check how many messages there are.
        const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('partnership_id', activePartnership.id)

        if (count && count > 0) {
            return { success: false, error: 'Database blocked deletion. You need a "DELETE" RLS policy on the "messages" table in Supabase.' }
        }

        // If count is 0, they were already empty.
        return { success: true, message: 'No messages to delete.' }
    }

    revalidatePath('/chat')
    return { success: true }
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not logged in')
    }

    const name = formData.get('name') as string
    const dobRaw = formData.get('dob') as string | null
    const dob = dobRaw && dobRaw.trim() !== '' ? dobRaw : null
    const gender = formData.get('gender') as string
    const avatarBase64 = formData.get('avatarBase64') as string | null

    const updates: any = {
        name,
        dob,
        gender,
    }

    if (avatarBase64) {
        try {
            const base64Data = avatarBase64.replace(/^data:image\/\w+;base64,/, "")
            const buffer = Buffer.from(base64Data, 'base64')
            const mimeMatch = avatarBase64.match(/^data:(image\/\w+);base64,/)
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
            const ext = mimeType.split('/')[1] || 'jpg'

            const fileName = `${user.id}-${Date.now()}.${ext}`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, buffer, {
                    contentType: mimeType,
                    upsert: true
                })

            if (!uploadError && uploadData) {
                const { data: publicUrlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName)

                updates.avatar_url = publicUrlData.publicUrl
            } else {
                console.error("Failed to upload avatar:", uploadError)
                if (uploadError && uploadError.message && uploadError.message.includes('Bucket not found')) {
                    // Fallback to storing base64 directly if bucket does not exist
                    updates.avatar_url = avatarBase64
                }
            }
        } catch (e) {
            console.error("Avatar upload error:", e)
            updates.avatar_url = avatarBase64
        }
    }

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

    if (error) {
        throw error
    }

    revalidatePath('/settings')
    return { success: true }
}
