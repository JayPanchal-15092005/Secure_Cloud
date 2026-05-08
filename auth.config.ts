import type { NextAuthConfig } from "next-auth";

// This is the config used by the middleware (Edge Runtime compatible)
// It does NOT include the Credentials provider (which uses bcryptjs) 
// because bcryptjs requires Node.js crypto APIs not available in Edge Runtime.
// The actual credential validation happens in auth.ts (server-side only).
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isAuthPage =
        nextUrl.pathname.startsWith("/sign-in") ||
        nextUrl.pathname.startsWith("/sign-up");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      return true;
    },
  },
  providers: [], // Providers are added in auth.ts
};
