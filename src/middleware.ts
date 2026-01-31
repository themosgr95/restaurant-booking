import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin", // <--- Forces the custom page
  },
});

export const config = {
  // Protect the dashboard and setup routes
  matcher: ["/staff/dashboard/:path*", "/setup-admin/:path*"],
};