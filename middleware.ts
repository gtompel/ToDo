import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

async function verifyEdgeJWT(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const publicRoutes = ["/login", "/register"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }
  const token = request.cookies.get("auth-token")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  const decoded = await verifyEdgeJWT(token)
  if (!decoded) {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("auth-token")
    return response
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
