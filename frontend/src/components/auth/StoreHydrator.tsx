"use client";

import { useAuthStore } from "@/store/auth-store";
import { User } from "@/lib/types";
import { useRef } from "react";

export function StoreHydrator({ user }: { user: User | null }) {
  const initialized = useRef(false);

  if (!initialized.current) {
    useAuthStore.setState({ user, isLoading: false });
    initialized.current = true;
  }

  return null;
}
