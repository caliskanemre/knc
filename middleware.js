import { NextResponse } from 'next/server';

export function middleware(req) {
  const { nextUrl, headers } = req;
  const { pathname, hostname, protocol } = nextUrl;

  // www zorunlu yönlendirme
  if (hostname === 'kinasepeti.com') {
    const url = nextUrl.clone();
    url.hostname = 'www.kinasepeti.com';
    return NextResponse.redirect(url);
  }

  // _next, assets veya API yollarını atla
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  // Kök path için Accept-Language’a göre locale yönlendirmesi
  if (pathname === '/' || pathname === '') {
    const acceptLang = headers.get('accept-language') || '';
    const prefersTR = acceptLang.toLowerCase().startsWith('tr');
    const targetLocale = prefersTR ? 'tr' : 'en';
    const url = nextUrl.clone();
    url.pathname = `/${targetLocale}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/((?!_next|api|static).*)',
  ],
};
