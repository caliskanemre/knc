import { NextResponse } from 'next/server';

export function middleware(request) {
    // We only need to run this logic for the product detail page
    const { pathname } = request.nextUrl;
    if (!pathname.startsWith('/products/detail')) {
        return NextResponse.next();
    }

    // 1. Check if the 'is_turkey_user' cookie is already set. If so, respect it.
    const cookie = request.cookies.get('is_turkey_user');
    if (cookie) {
        return NextResponse.next();
    }

    // 2. If no cookie, determine location. Default to false (EUR).
    let isTR = false;

    // Vercel provides geo-location information automatically.
    // 'geo' object contains country code: https://vercel.com/docs/concepts/edge-network/headers#x-vercel-ip-country
    const country = request.geo?.country?.toUpperCase();
    if (country === 'TR') {
        isTR = true;
    } else {
        // Fallback: Check 'Accept-Language' header for Turkish preference
        const acceptLanguage = request.headers.get('accept-language');
        if (acceptLanguage && acceptLanguage.toLowerCase().includes('tr')) {
            isTR = true;
        }
    }

    // Create a response to set the new cookie
    const response = NextResponse.next();

    // Set the cookie. It will be available for client-side JavaScript to read.
    // max-age is set to ~6 months (in seconds)
    response.cookies.set('is_turkey_user', isTR ? '1' : '0', {
        path: '/',
        maxAge: 15552000,
    });

    return response;
}

// This specifies that the middleware should only run on requests to product detail pages.
export const config = {
    matcher: '/products/detail/:path*',
};
