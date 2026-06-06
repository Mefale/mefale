import { withAuth } from "next-auth/middleware";

export const middleware = withAuth({
  pages: {
    signIn: "/admin/login",
  },
});

export const config = {
  matcher: ["/admin/((?!login).*)"],
};
