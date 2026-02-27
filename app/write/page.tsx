import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WriteForm from './WriteForm'

export default async function WritePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: partnerships } = await supabase
        .from('partnerships')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .limit(1)

    // Check if the user already wrote an entry today
    const currentHour = new Date().getHours()
    const logicalDate = new Date()
    if (currentHour >= 0 && currentHour < 2) {
        logicalDate.setDate(logicalDate.getDate() - 1)
    }
    const logicalDateStr = logicalDate.toISOString().split('T')[0]

    const { data: todaysEntry } = await supabase
        .from('diaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('logical_date', logicalDateStr)
        .single()

    return <WriteForm initialData={todaysEntry} />
}
