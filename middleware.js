import { NextResponse } from 'next/server';

/**
 * IP'den ülke tespiti yapar (Backend'deki getCountryFromIp ile aynı mantık)
 */
async function getCountryFromIp(ip) {
    // Local/development IP kontrolü
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return null;
    }

    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(2000)
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                return data.countryCode;
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
    if (clientIp && clientIp.includes(',')) {
        clientIp = clientIp.split(',')[0].trim();
    }
    return clientIp || '127.0.0.1';
}

export async function middleware(request) {
    const { pathname, locale } = request.nextUrl;

    // Skip middleware for static files, api routes, and _next internal routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
    ) {
        return NextResponse.next();
    }

    // Check if the 'is_turkey_user' cookie is already set
    const cookie = request.cookies.get('is_turkey_user');

    // Eğer cookie varsa, middleware'i bypass et - kullanıcı tercihini yapmış
    if (cookie) {
        return NextResponse.next();
    }

    // Cookie yok - ilk ziyaret, lokasyon tespiti yap
    let isTR = false;

    // 1. Önce Vercel geo-location bilgisini kontrol et
    const country = request.geo?.country?.toUpperCase();

    if (country === 'TR') {
        isTR = true;
    } else if (country) {
        isTR = false;
    } else {
        // 2. Geo bilgisi yoksa, IP'den ülke tespiti yap
        const clientIp = getClientIp(request);

        try {
            const ipCountry = await getCountryFromIp(clientIp);

            if (ipCountry === 'TR') {
                isTR = true;
            } else if (ipCountry) {
                isTR = false;
            } else {
                // 3. IP lookup da başarısız olursa, Accept-Language header'ına bak
                const acceptLanguage = request.headers.get('accept-language');
                if (acceptLanguage && acceptLanguage.toLowerCase().includes('tr')) {
                    isTR = true;
                }
            }
        } catch (error) {
            // Fallback: Accept-Language header'ına bak
            const acceptLanguage = request.headers.get('accept-language');
            if (acceptLanguage && acceptLanguage.toLowerCase().includes('tr')) {
                isTR = true;
            }
        }
    }

    // Hedef locale'i belirle
    const targetLocale = isTR ? 'tr' : 'en';

    // Eğer mevcut locale hedef locale ile eşleşmiyorsa, redirect et
    if (locale !== targetLocale) {
        const url = request.nextUrl.clone();
        url.locale = targetLocale;

        const response = NextResponse.redirect(url);

        // Cookie'yi set et ki bir sonraki istekte tekrar redirect olmasın
        response.cookies.set('is_turkey_user', isTR ? '1' : '0', {
            path: '/',
            maxAge: 15552000,
            sameSite: 'lax'
        });

        return response;
    }

    // Locale doğru, sadece cookie'yi set et
    const response = NextResponse.next();
    response.cookies.set('is_turkey_user', isTR ? '1' : '0', {
        path: '/',
        maxAge: 15552000,
        sameSite: 'lax'
    });

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
