import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) return null;
        if (credentials?.email === email && credentials?.password === password) {
          return { id: "1", email, name: "Admin" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
