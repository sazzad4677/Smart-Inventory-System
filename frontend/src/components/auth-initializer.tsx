"use client";
import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";
import { User } from "@/lib/types";

export function AuthInitializer({ user }: { user: User | null }) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    if (user) {
      setUser(user);
    } else {
      clearUser();
    }
  }, [user, setUser, clearUser]);

  return null;
}
