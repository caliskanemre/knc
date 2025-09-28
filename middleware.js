import { NextResponse } from 'next/server';

export function middleware(request) {
    const { geo } = request;
    const country = geo?.country || 'TR'; // Vercel'den ülke bilgisi al, yoksa TR varsay
    const response = NextResponse.next();

    // Cookie yoksa, ülkeyi cookie'ye set et
    if (!request.cookies.has('user-country')) {
        response.cookies.set('user-country', country, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 gün geçerli
        });
    }

    return response;
}

// --- BU KISMI EKLEYİN ---
// Middleware'in hangi yollarda (path) çalışacağını belirtir.
export const config = {
    // '/:path*' ile ana sayfa dahil tüm sayfalarda çalışmasını,
    // ancak _next, api, favicon.ico gibi statik dosya ve API isteklerini
    // hariç tutmasını sağlıyoruz.
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ],
};
