import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname, locale } = request.nextUrl;

    // Skip middleware for static files, api routes, and _next internal routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') // files with extensions
    ) {
        return NextResponse.next();
    }

    // 1. Check if the 'is_turkey_user' cookie is already set
    const cookie = request.cookies.get('is_turkey_user');

    let isTR = false;
    let shouldSetCookie = false;

    if (cookie) {
        // Cookie exists, use its value
        isTR = cookie.value === '1' || cookie.value === 'true';
    } else {
        // No cookie, determine location
        shouldSetCookie = true;

        // Vercel provides geo-location information automatically
        const country = request.geo?.country?.toUpperCase();
        if (country === 'TR') {
            isTR = true;
        } else if (country) {
            // If we have country info and it's not TR, user is not from Turkey
            isTR = false;
        } else {
            // Fallback: Check 'Accept-Language' header for Turkish preference
            const acceptLanguage = request.headers.get('accept-language');
            if (acceptLanguage && acceptLanguage.toLowerCase().includes('tr')) {
                isTR = true;
            }
        }
    }

    // Determine the target locale based on is_turkey_user
    const targetLocale = isTR ? 'tr' : 'en';

    // If current locale doesn't match target locale, redirect
    if (locale !== targetLocale) {
        const url = request.nextUrl.clone();
        url.locale = targetLocale;

        const response = NextResponse.redirect(url);

        // Set cookie if needed
        if (shouldSetCookie) {
            response.cookies.set('is_turkey_user', isTR ? '1' : '0', {
                path: '/',
                maxAge: 15552000, // ~6 months
            });
        }

        return response;
    }

    // Locale matches, just set cookie if needed
    if (shouldSetCookie) {
        const response = NextResponse.next();
        response.cookies.set('is_turkey_user', isTR ? '1' : '0', {
            path: '/',
            maxAge: 15552000,
        });
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    ],
};
