import { NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['tr', 'en'];

function getPathLocale(pathname) {
    const seg = pathname.split('/')[1];
    return SUPPORTED_LOCALES.includes(seg) ? seg : null;
}

function stripLeadingLocale(pathname) {
    const loc = getPathLocale(pathname);
    if (!loc) return pathname;
    const rest = pathname.slice(loc.length + 1); // remove '/{loc}'
    return rest ? `/${rest}` : '/';
}

function getClientIp(request) {
    let ip = request.headers.get('x-forwarded-for');
    if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();
    if (!ip || ip === 'unknown') ip = request.headers.get('x-real-ip');
    if (!ip) ip = request.ip; // next runtime ip
    return ip || '';
}

async function lookupCountry(ip) {
    // Private / local IP ise lookup yapmaya gerek yok
    if (!ip || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('127.') || ip === '::1') {
        return null; // geo yok, default TR'a düşeceğiz
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
    const { pathname } = request.nextUrl;

    // Statik ve internal dosyaları atla
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|json|txt|xml|map)$/)
    ) {
        return NextResponse.next();
    }

    // Path üzerinde locale var mı kontrol et
    const pathLocale = getPathLocale(pathname);

    // Kullanıcı manuel olarak bir locale seçmişse (URL'de /tr/ veya /en/ varsa)
    if (pathLocale) {
        // Manuel seçimi cookie'ye kaydet ve devam et
        const response = NextResponse.next();
        const isTR = pathLocale === 'tr';
        response.cookies.set('is_turkey_user', isTR ? '1' : '0', { path: '/', maxAge: 15552000, sameSite: 'lax' });
        return response;
    }

    // Path'te locale yok - otomatik yönlendirme yap
    const cookie = request.cookies.get('is_turkey_user');

    let targetLocale = 'tr'; // Default olarak Türkçe

    if (cookie) {
        // Cookie varsa onu kullan
        targetLocale = cookie.value === '1' ? 'tr' : 'en';
    } else {
        // Cookie yoksa geo-location ile tespit et
        let country = request.geo?.country ? request.geo.country.toUpperCase() : null;
        if (!country) {
            const ip = getClientIp(request);
            country = await lookupCountry(ip);
        }
        // Türkiye ise TR, değilse EN, hiçbiri tespit edilemezse default TR
        const isTR = country === 'TR' || !country;
        targetLocale = isTR ? 'tr' : 'en';
    }

    // Locale ekleyerek redirect yap
    const url = request.nextUrl.clone();
    url.pathname = `/${targetLocale}${pathname === '/' ? '' : pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set('is_turkey_user', targetLocale === 'tr' ? '1' : '0', { path: '/', maxAge: 15552000, sameSite: 'lax' });
    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
