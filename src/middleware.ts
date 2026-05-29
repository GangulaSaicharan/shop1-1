import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const key = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-dev-secret-change-in-production"
);

// Always public regardless of method
const ALWAYS_PUBLIC = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
];

// Public for GET only — storefront reads these; write operations still require auth
const PUBLIC_GET_PATHS = [
  "/api/products/published",
  "/api/categories",
  "/api/brands",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ALWAYS_PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (request.method === "GET" && PUBLIC_GET_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;

  const unauthorized = pathname.startsWith("/api/")
    ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    : NextResponse.redirect(new URL("/login", request.url));

  if (!token) return unauthorized;

  try {
    await jwtVerify(token, key, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch {
    return unauthorized;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
