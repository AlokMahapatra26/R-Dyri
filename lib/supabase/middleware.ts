import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
    const isProtected = request.nextUrl.pathname.startsWith('/write') || request.nextUrl.pathname.startsWith('/entry') || request.nextUrl.pathname === '/'
    const isSetupRoute = request.nextUrl.pathname.startsWith('/setup')

    if (!user && isProtected) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user && isAuthRoute) {
        // user is logged in, redirect away from login page
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // If user is logged in and trying to access a protected route (not setup), check partnership status
    if (user && isProtected && !isSetupRoute) {
        const userEmail = user.email

        if (userEmail) {
            const { data: partnerships } = await supabase
                .from('partnerships')
                .select('status')
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id},user2_email.eq.${userEmail}`)
                .eq('status', 'accepted')
                .limit(1)

            const hasActivePartnership = partnerships && partnerships.length > 0

            if (!hasActivePartnership) {
                const url = request.nextUrl.clone()
                url.pathname = '/setup'
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}
