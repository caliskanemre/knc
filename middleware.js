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
        return null; // geo yok, default EN'a düşeceğiz
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

    const cookie = request.cookies.get('is_turkey_user');
    if (cookie) {
        // Kullanıcı tercihi / ilk tespit yapılmış
        return NextResponse.next();
    }

    // Path üzerinde locale var mı? (kullanıcı manuel seçmiş olabilir)
    const pathLocale = getPathLocale(pathname);

    // Ülke tespiti: Önce Vercel geo (Vercel deploy'unda çalışır), yoksa IP lookup, o da yoksa default EN
    let country = request.geo?.country ? request.geo.country.toUpperCase() : null;
    if (!country) {
        const ip = getClientIp(request);
        country = await lookupCountry(ip); // başarısız olursa null döner
    }

    // Türkiye ise TR, değilse EN aç.
    const isTR = country === 'TR';
    const targetLocale = isTR ? 'tr' : 'en';

    // Eğer path üzerinde locale yoksa ilk ziyarette otomatik ekle
    if (!pathLocale) {
        const url = request.nextUrl.clone();
        const cleanPath = stripLeadingLocale(pathname); // güvenlik için
        url.pathname = `/${targetLocale}${cleanPath === '/' ? '' : cleanPath}`;
        const response = NextResponse.redirect(url);
        response.cookies.set('is_turkey_user', isTR ? '1' : '0', { path: '/', maxAge: 15552000, sameSite: 'lax' });
        return response;
    }

    // Path locale mevcut ama yanlış ve henüz cookie yoksa (ilk ziyaret) düzelt
    if (pathLocale !== targetLocale) {
        const url = request.nextUrl.clone();
        const remainder = stripLeadingLocale(pathname); // mevcut locale'i at
        url.pathname = `/${targetLocale}${remainder === '/' ? '' : remainder}`;
        const response = NextResponse.redirect(url);
        response.cookies.set('is_turkey_user', isTR ? '1' : '0', { path: '/', maxAge: 15552000, sameSite: 'lax' });
        return response;
    }

    // Locale zaten doğru: sadece cookie set et ve devam et
    const response = NextResponse.next();
    response.cookies.set('is_turkey_user', isTR ? '1' : '0', { path: '/', maxAge: 15552000, sameSite: 'lax' });
    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
