import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        const { data: diaries, error: diariesError } = await supabase
            .from('diaries')
            .select('*')

        return NextResponse.json({
            ok: true,
            user: user ? user.id : null,
            userError,
            diariesCount: diaries ? diaries.length : 0,
            diariesError,
            env: {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            }
        })
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message })
    }
}
