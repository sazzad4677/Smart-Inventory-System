"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store/auth-store";
import { User } from "@/lib/types";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      setUser(session.user as User);
    } else if (status === "unauthenticated") {
      // Only clear the user if the session is truly gone
      // This prevents clearing the hydrated user while NextAuth is struggling
      if (!session) {
        // setUser(null); // Temporarily disabling to let hydration stick
      }
    }
  }, [session, status, setUser]);

  return <>{children}</>;
}
