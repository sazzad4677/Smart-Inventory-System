import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { User as UserType } from "@/lib/types";

declare module "next-auth" {
  interface User {
    _id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    user: UserType & DefaultSession["user"];
    accessToken?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    user?: {
      _id?: string;
      name?: string | null;
      email?: string | null;
      role?: string;
    };
    error?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const API_URL =
          process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const result = await res.json();

          if (res.ok && result.success && result.data) {
            return {
              _id: result.data.user.id,
              email: result.data.user.email,
              role: result.data.user.role as UserType["role"],
              accessToken: result.data.accessToken,
              refreshToken:
                res.headers
                  .get("set-cookie")
                  ?.match(/refreshToken=([^;]+)/)?.[1] || "",
            };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }): Promise<JWT> {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          user: {
            _id: user._id,
            email: user.email,
            role: user.role,
          },
          accessTokenExpires: getTokenExpiry(user.accessToken),
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.user) {
        session.user._id = token.user._id as string;
        session.user.role = token.user.role as UserType["role"];
        session.user.name = token.user.name ?? undefined;
      }
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
});

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const API_URL =
      process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw result;
    }

    return {
      ...token,
      accessToken: result.data.accessToken,
      accessTokenExpires: getTokenExpiry(result.data.accessToken),
      refreshToken: result.data.refreshToken ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

function getTokenExpiry(token?: string): number {
  if (!token) return 0;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return 0;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    return payload.exp * 1000; // convert seconds to milliseconds
  } catch {
    return Date.now() + 15 * 60 * 1000;
  }
}
