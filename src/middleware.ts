import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Redirect admin to admin page if they are at /partner (optional logic)
        if (path.startsWith("/admin") && token?.role !== "admin") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname;
                // Exclude login and join from protection
                if (path === "/partner/login" || path === "/partner/join") {
                    return true;
                }
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/partner/:path*"],
};
