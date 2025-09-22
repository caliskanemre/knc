import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const SUPPORTED_LOCALES = ['tr', 'en'];
const DEFAULT_LOCALE = 'tr';

export function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // Skip next internals, API routes and public files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/locales') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.json' ||
    pathname.startsWith('/favicon') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // If path already has a supported locale, continue
  const hasLocalePrefix = SUPPORTED_LOCALES.some((loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`));
  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  // Determine preferred locale from Accept-Language; fallback to default
  const header = req.headers.get('accept-language') || '';
  const lower = header.toLowerCase();
  const prefersEN = lower.startsWith('en') || lower.includes(' en');
  const locale = prefersEN ? 'en' : DEFAULT_LOCALE;

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  // preserve search params
  url.search = search || '';
  return NextResponse.redirect(url);
}

export const config = {
  // Match all request paths except for the ones starting with _next or having a file extension
  matcher: ['/((?!_next|api|locales|.*\\..*).*)'],
};
