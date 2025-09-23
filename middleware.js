import { NextResponse } from 'next/server';

const DEFAULT_LOCALE = 'tr';
const SUPPORTED = new Set(['tr', 'en']);

export function middleware(req) {
  const { nextUrl, headers, cookies } = req;
  const url = nextUrl.clone();
  const { pathname, search } = url;

  // Dahili yolları atla
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/locales')
  ) {
    return NextResponse.next();
  }

  const seg = pathname.split('/')[1];
  const hasLocaleInPath = SUPPORTED.has(seg);

  const cookieLocale = cookies.get('NEXT_LOCALE')?.value;
  const acceptLang = headers.get('accept-language') || '';
  const preferred = acceptLang.toLowerCase().includes('tr') ? 'tr' : 'en';

  // Dil çerezi yoksa veya bozuksa, tercih edilen dili kullan
  const effectiveCookie = SUPPORTED.has(cookieLocale) ? cookieLocale : undefined;

  // 1) Path’te dil YOKSA: defaultLocale (tr) için prefix eklemeyelim; en için /en ekleyelim
  if (!hasLocaleInPath) {
    const target = effectiveCookie || preferred || DEFAULT_LOCALE;

    // tr (default) ise olduğu gibi devam et; sadece çerez yaz
    if (target === DEFAULT_LOCALE) {
      const res = NextResponse.next();
      res.cookies.set('NEXT_LOCALE', DEFAULT_LOCALE, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
      return res;
    }

    // en ise /en prefix ekleyerek yönlendir
    const redirectUrl = new URL(`/en${pathname}${search}`, req.url);
    const res = NextResponse.redirect(redirectUrl);
    res.cookies.set('NEXT_LOCALE', 'en', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
    return res;
  }

  // 2) Path’te dil VARSA: /tr/... için kanonik olarak /...’a yönlendir (loop’u önler)
  if (seg === DEFAULT_LOCALE) {
    const rest = pathname.slice(3) || '/'; // remove '/tr'
    const redirectUrl = new URL(rest.startsWith('/') ? `${rest}${search}` : `/${rest}${search}`, req.url);
    const res = NextResponse.redirect(redirectUrl);
    res.cookies.set('NEXT_LOCALE', DEFAULT_LOCALE, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
    return res;
  }

  // 3) /en/... için çerezi senkronize et, yönlendirme yapma
  if (seg === 'en' && effectiveCookie !== 'en') {
    const res = NextResponse.next();
    res.cookies.set('NEXT_LOCALE', 'en', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/|api|favicon.ico|robots.txt|sitemap.xml|manifest.json|locales).*)',
  ],
};
