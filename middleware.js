import { NextResponse } from 'next/server';

/**
 * IP'den ülke tespiti yapar (Backend'deki getCountryFromIp ile aynı mantık)
 */
async function getCountryFromIp(ip) {
    // Local/development IP kontrolü
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        // Development ortamında test için - gerçek production'da bu kod çalışmaz
        return null; // Fallback kullanılacak
    }

    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(2000) // 2 saniye timeout
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                return data.countryCode; // 'TR', 'US', vb.
            }
        }
    } catch (error) {
        console.log('[Middleware] IP lookup failed:', error.message);
    }

    return null;
}

/**
 * Client IP adresini alır
 */
function getClientIp(request) {
    let clientIp = request.headers.get('x-forwarded-for');
    if (!clientIp || clientIp === 'unknown') {
        clientIp = request.headers.get('x-real-ip');
    }
    if (!clientIp) {
        clientIp = request.ip;
    }
    // Eğer birden fazla IP varsa, ilkini al
    if (clientIp && clientIp.includes(',')) {
        clientIp = clientIp.split(',')[0].trim();
    }
    return clientIp || '127.0.0.1';
}

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files, api routes, and _next internal routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
    ) {
        return NextResponse.next();
    }

    console.log('[Middleware] Processing:', pathname);

    // Check if the 'is_turkey_user' cookie is already set
    const cookie = request.cookies.get('is_turkey_user');

    let isTR = false;
    let shouldSetCookie = false;

    if (cookie) {
        // Cookie exists, use its value
        isTR = cookie.value === '1' || cookie.value === 'true';
        console.log('[Middleware] Cookie found:', cookie.value, 'isTR:', isTR);
    } else {
        // No cookie, determine location
        shouldSetCookie = true;

        // 1. Önce Vercel geo-location bilgisini kontrol et
        const country = request.geo?.country?.toUpperCase();
        console.log('[Middleware] Geo country:', country);

        if (country === 'TR') {
            isTR = true;
        } else if (country) {
            // Geo bilgisi var ve TR değil
            isTR = false;
        } else {
            // 2. Geo bilgisi yoksa, IP'den ülke tespiti yap
            const clientIp = getClientIp(request);
            console.log('[Middleware] Client IP:', clientIp);

            try {
                const ipCountry = await getCountryFromIp(clientIp);
                console.log('[Middleware] IP Country:', ipCountry);

                if (ipCountry === 'TR') {
                    isTR = true;
                } else if (ipCountry) {
                    isTR = false;
                } else {
                    // 3. IP lookup da başarısız olursa, Accept-Language header'ına bak
                    const acceptLanguage = request.headers.get('accept-language');
                    console.log('[Middleware] Accept-Language:', acceptLanguage);
                    if (acceptLanguage && acceptLanguage.toLowerCase().includes('tr')) {
                        isTR = true;
                    }
                }
            } catch (error) {
                console.log('[Middleware] Error in IP lookup, using Accept-Language fallback');
                // Fallback: Accept-Language header'ına bak
                const acceptLanguage = request.headers.get('accept-language');
                if (acceptLanguage && acceptLanguage.toLowerCase().includes('tr')) {
                    isTR = true;
                }
            }
        }
        console.log('[Middleware] Determined isTR:', isTR);
    }

    // Determine the target locale based on is_turkey_user
    const targetLocale = isTR ? 'tr' : 'en';
    console.log('[Middleware] Target locale:', targetLocale);

    // Check if URL already has a locale prefix
    const pathnameHasLocale = pathname.startsWith('/tr') || pathname.startsWith('/en') || pathname.startsWith('/et');

    if (!pathnameHasLocale) {
        // No locale in URL, redirect to the target locale
        console.log('[Middleware] No locale in URL, redirecting to:', targetLocale);
        const url = request.nextUrl.clone();
        url.pathname = `/${targetLocale}${pathname}`;

        const response = NextResponse.redirect(url);

        if (shouldSetCookie) {
            response.cookies.set('is_turkey_user', isTR ? '1' : '0', {
                path: '/',
                maxAge: 15552000, // ~6 months
            });
        }

        return response;
    }

    // Extract current locale from pathname
    const currentLocale = pathname.split('/')[1]; // 'tr', 'en', or 'et'
    console.log('[Middleware] Current locale:', currentLocale);

    // If current locale doesn't match target locale, redirect
    if (currentLocale !== targetLocale) {
        console.log('[Middleware] Locale mismatch, redirecting from', currentLocale, 'to', targetLocale);
        const url = request.nextUrl.clone();
        // Replace the locale in the pathname
        url.pathname = pathname.replace(`/${currentLocale}`, `/${targetLocale}`);

        const response = NextResponse.redirect(url);

        if (shouldSetCookie) {
            response.cookies.set('is_turkey_user', isTR ? '1' : '0', {
                path: '/',
                maxAge: 15552000,
            });
        }

        return response;
    }

    // Locale matches, just set cookie if needed
    if (shouldSetCookie) {
        console.log('[Middleware] Setting cookie, isTR:', isTR);
        const response = NextResponse.next();
        response.cookies.set('is_turkey_user', isTR ? '1' : '0', {
            path: '/',
            maxAge: 15552000,
        });
        return response;
    }

    console.log('[Middleware] No action needed');
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
