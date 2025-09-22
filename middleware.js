import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

// Hiçbir route ile eşleşmesin (fiilen kapalı)
export const config = {
  matcher: [],
};
