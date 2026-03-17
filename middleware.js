export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Protect all routes except:
     * - /login
     * - /api/auth (NextAuth routes)
     * - /_next (static files)
     * - /favicon.ico
     */
    "/((?!login|scan|api/auth|_next|favicon.ico).*)",
  ],
};
