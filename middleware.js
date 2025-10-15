import { NextResponse } from 'next/server';

function getClientIp(request) {
    let ip = request.headers.get('x-forwarded-for');
    if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();
    if (!ip || ip === 'unknown') ip = request.headers.get('x-real-ip');
    if (!ip) ip = request.ip;
    return ip || '';
}

async function lookupCountry(ip) {
    if (!ip || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('127.') || ip === '::1') {
        return null;
    }
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1200);
        const resp = await fetch(`https://ipapi.co/${ip}/json/`, { signal: controller.signal });
        clearTimeout(timeout);
        if (!resp.ok) return null;
        const data = await resp.json();
        return (data && data.country_code) ? data.country_code.toUpperCase() : null;
    } catch (_) {
        return null;
    }
}

export async function middleware(request) {
    const { pathname, locale } = request.nextUrl;

    // Statik ve internal dosyaları atla
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|json|txt|xml|map)$/)
    ) {
        return NextResponse.next();
    }

    // ÖNEMLI: Eğer URL tam olarak /tr/ veya /en/ ise (trailing slash ile), trailing slash'siz versiyona redirect et
    const url = request.nextUrl.clone();
    const fullPath = url.pathname;

    if (fullPath === '/tr/' || fullPath === '/en/') {
        url.pathname = fullPath.slice(0, -1); // Trailing slash'i kaldır
        return NextResponse.redirect(url, 308); // 308 Permanent Redirect
    }

    // Mevcut locale'i al (Next.js i18n routing'den)
    const currentLocale = locale || 'tr';

    // Cookie kontrolü
    const cookie = request.cookies.get('is_turkey_user');

    // Root path kontrolü
    if (pathname === '/' || pathname === '') {
        // Cookie yoksa geo-location ile tespit et
        if (!cookie) {
            // Geo-location ile ülke tespit et
            let country = request.geo?.country ? request.geo.country.toUpperCase() : null;
            if (!country) {
                const ip = getClientIp(request);
                country = await lookupCountry(ip);
            }

            // Türkiye ise TR, değilse EN, tespit edilemezse default TR
            const isTR = country === 'TR' || !country;
            const targetLocale = isTR ? 'tr' : 'en';

            // Eğer tespit edilen locale ile mevcut locale farklıysa redirect yap
            if (targetLocale !== currentLocale) {
                url.locale = targetLocale;
                const response = NextResponse.redirect(url);
                response.cookies.set('is_turkey_user', isTR ? '1' : '0', {
                    path: '/',
                    maxAge: 15552000,
                    sameSite: 'lax'
                });
                return response;
            }

            // Cookie'yi set et ve devam et
            const response = NextResponse.next();
            response.cookies.set('is_turkey_user', isTR ? '1' : '0', {
                path: '/',
                maxAge: 15552000,
                sameSite: 'lax'
            });
            return response;
        }

        // Cookie varsa, mevcut locale ile devam et ve cookie'yi güncelle
        const response = NextResponse.next();
        const isTR = currentLocale === 'tr';
        response.cookies.set('is_turkey_user', isTR ? '1' : '0', {
            path: '/',
            maxAge: 15552000,
            sameSite: 'lax'
        });
        return response;
    }

    // Diğer tüm sayfalar için cookie'yi güncelle
    const response = NextResponse.next();
    const isTR = currentLocale === 'tr';
    response.cookies.set('is_turkey_user', isTR ? '1' : '0', {
        path: '/',
        maxAge: 15552000,
        sameSite: 'lax'
    });

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
