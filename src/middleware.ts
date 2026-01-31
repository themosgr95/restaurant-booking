import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin", // <--- THIS LINE IS CRITICAL
  },
});

export const config = {
  // Protect these routes
  matcher: ["/staff/:path*", "/setup-admin/:path*"],
};