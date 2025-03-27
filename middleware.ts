import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value; // Assuming you store JWT token in cookies

    // If user is not authenticated, redirect to login
    if (!token && req.nextUrl.pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

// Apply middleware to protected routes
export const config = {
    matcher: ["/exam/:path*", "/test/:path*"], // Add your protected routes here
};
