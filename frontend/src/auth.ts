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
    refreshToken?: string;
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
              refreshToken: result.data.refreshToken,
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
            _id: user.id,
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

      // If we already have a refresh error, stop trying to refresh
      if (token.error === "RefreshAccessTokenError") {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.user) {
        session.user.id = token.user.id as string;
        session.user.role = token.user.role as UserType["role"];
        session.user.email = token.user.email as string;
        session.user.name = (token.user.name ?? undefined) as
          | string
          | undefined;
      }
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
});

const refreshPromises = new Map<string, Promise<JWT>>();

async function refreshAccessToken(token: JWT): Promise<JWT> {
  // If a refresh is already in progress for this token, return that promise
  if (token.refreshToken && refreshPromises.has(token.refreshToken)) {
    return refreshPromises.get(token.refreshToken)!;
  }

  const refreshPromise = (async () => {
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
    } finally {
      // Clean up the promise from the cache
      if (token.refreshToken) {
        refreshPromises.delete(token.refreshToken);
      }
    }
  })();

  if (token.refreshToken) {
    refreshPromises.set(token.refreshToken, refreshPromise);
  }

  return refreshPromise;
}

function getTokenExpiry(token?: string): number {
  if (!token) return 0;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return 0;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    return payload.exp * 1000; // convert seconds to milliseconds
  } catch {
    // fallback: 15 min if token is malformed
    return Date.now() + 15 * 60 * 1000;
  }
}
