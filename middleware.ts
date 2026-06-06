export { default } from "next-auth/middleware";

export const config = {
  // Protect all /admin routes except /admin/login
  matcher: ["/admin/((?!login).*)"],
};
