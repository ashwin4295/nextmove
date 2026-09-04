import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return NextResponse.next();
  const key = request.nextUrl.searchParams.get("key");
  if (key !== adminKey) {
    return new NextResponse("Unauthorised", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin"],
};
