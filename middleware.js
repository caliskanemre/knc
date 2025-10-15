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

// Varsayılan dil Türkçe. Kullanıcı açıkça /en isterse kalır.
export async function middleware(request) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|json|txt|xml|map)$/)
    ) {
        return NextResponse.next();
    }

    const pathLocale = getPathLocale(pathname);

    if (pathLocale) {
        const response = NextResponse.next();
        response.cookies.set('is_turkey_user', pathLocale === 'tr' ? '1' : '0', { path: '/', maxAge: 15552000, sameSite: 'lax' });
        return response;
    }

    const url = request.nextUrl.clone();
    const cleanPath = stripLeadingLocale(pathname);
    url.pathname = `/tr${cleanPath === '/' ? '' : cleanPath}`;
    const response = NextResponse.redirect(url);
    response.cookies.set('is_turkey_user', '1', { path: '/', maxAge: 15552000, sameSite: 'lax' });
    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
