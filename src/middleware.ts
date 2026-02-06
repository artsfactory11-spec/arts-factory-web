import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token as any;
        const path = req.nextUrl.pathname;

        // Force a server-side log that is hard to miss
        console.log("-----------------------------------------");
        console.log(`[AUTH_DEBUG] Path: ${path}`);
        console.log(`[AUTH_DEBUG] User Role: ${token?.role || 'null'}`);
        console.log(`[AUTH_DEBUG] Has Token: ${!!token}`);
        console.log("-----------------------------------------");

        // 1. Admin Protection
        if (path.startsWith("/admin")) {
            // Include admin login page in the protection bypass (prevent infinite loop if it matches /admin)
            if (path === "/admin/login") {
                return;
            }

            if (!token) {
                console.log("[AUTH_DEBUG] No token for /admin, redirecting to /admin/login");
                return NextResponse.redirect(new URL("/admin/login", req.url));
            }
            if (token.role !== "admin") {
                console.log(`[AUTH_DEBUG] ACCESS DENIED: Role '${token.role}' is not admin. Redirecting to admin login.`);
                return NextResponse.redirect(new URL("/admin/login?error=AccessDenied", req.url));
            }
            console.log("[AUTH_DEBUG] Admin access granted");
        }

        // 2. Partner Protection
        if (path.startsWith("/partner")) {
            // Exclude login/join pages
            if (path === "/partner/login" || path === "/partner/join") {
                return;
            }

            if (!token) {
                console.log("[AUTH_DEBUG] No token for /partner, redirecting to /partner/login");
                return NextResponse.redirect(new URL("/partner/login", req.url));
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Return true to let the middleware function handle the redirects manually
                // This prevents the default behavior of redirecting to a single 'pages.signIn' URL
                return true;
            },
        },
        pages: {
            // This is less relevant now as we handle redirects manually, 
            // but effectively acts as a fallback for other protected routes if any
            signIn: '/login',
        },
    }
);

export const config = {
    matcher: ["/admin", "/admin/:path*", "/partner", "/partner/:path*"],
};
