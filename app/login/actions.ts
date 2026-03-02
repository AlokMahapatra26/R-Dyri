'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?message=' + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name // Appends to raw_user_meta_data for backup and triggers
            }
        }
    })

    if (error) {
        redirect('/register?message=' + encodeURIComponent(error.message))
    }

    // Force update the profile name immediately in case the trigger takes a moment
    // or doesn't pull the name correctly.
    if (authData?.user && name) {
        await supabase
            .from('profiles')
            .update({ name })
            .eq('id', authData.user.id)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/register')
}
