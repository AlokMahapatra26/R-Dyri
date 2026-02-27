'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function invitePartner(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const email = formData.get('email') as string
    if (!email) return { error: "Email is required" }

    // Check if target email already has an accepted partnership
    const { data: existingPartnerships } = await supabase
        .from('partnerships')
        .select('id')
        .or(`user1_email.eq.${email},user2_email.eq.${email}`)
        .eq('status', 'accepted')
        .limit(1)

    if (existingPartnerships && existingPartnerships.length > 0) {
        return { error: "They already have a partner mate, sorry" }
    }

    const { error } = await supabase
        .from('partnerships')
        .insert({
            user1_id: user.id,
            user1_email: user.email,
            user2_email: email,
            status: 'pending'
        })

    if (error) {
        if (error.code === '23505') {
            return { error: "An invitation already exists." }
        }
        return { error: error.message }
    }

    revalidatePath('/setup')
    redirect('/')
}

export async function acceptInvitation(partnershipId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('partnerships')
        .update({
            user2_id: user.id,
            status: 'accepted'
        })
        .eq('id', partnershipId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/setup')
    redirect('/')
}

export async function cancelInvitation(partnershipId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('partnerships')
        .delete()
        .match({ id: partnershipId, user1_id: user.id, status: 'pending' })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/setup')
}
