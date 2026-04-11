"use client";

import React, { useEffect, useState, useTransition } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  getUsersAction,
  revokeUserSessionsAction,
} from "@/actions/user.actions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { FilterField } from "@/components/shared/filter-bar";
import { UserRole } from "@/lib/validations";
import { ActionModal } from "@/components/shared/action-modal";
import { UsersTable, UserWithSessions } from "./_components/users-table";

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithSessions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { user: currentUser } = useAuthStore();

  // Modal state
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [userToRevoke, setUserToRevoke] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const fetchUsers = React.useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await getUsersAction();
      setUsers(data || []);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(false);
  }, [fetchUsers]);

  const handleRevokeClick = React.useCallback(
    (userId: string, email: string) => {
      if (userId === currentUser?._id) {
        return toast.error(
          "You cannot revoke your own sessions from here. Use Logout.",
        );
      }
      setUserToRevoke({ id: userId, email });
      setIsRevokeModalOpen(true);
    },
    [currentUser?._id],
  );

  const confirmRevoke = async () => {
    if (!userToRevoke) return;

    startTransition(async () => {
      const result = await revokeUserSessionsAction(userToRevoke.id);
      if (result) {
        toast.success(
          `All sessions for ${userToRevoke.email} have been revoked.`,
        );
        setIsRevokeModalOpen(false);
        setUserToRevoke(null);
        fetchUsers();
      }
    });
  };

  // Filter configuration
  const filters: FilterField[] = [
    {
      key: "search",
      label: "Search",
      type: "search",
      placeholder: "Search by email or role...",
    },
    {
      key: "role",
      label: "Role",
      type: "select",
      options: [
        { label: "All Roles", value: "all" },
        { label: "Administrator", value: UserRole.Admin },
        { label: "Manager", value: UserRole.Manager },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="User Management"
        description="View all registered users, monitor active sessions, and manage access."
      />

      <UsersTable
        users={users}
        isLoading={isLoading}
        onRevoke={handleRevokeClick}
        currentUser={currentUser}
        isPending={isPending}
        fetchUsers={fetchUsers}
        filters={filters}
      />

      {/* Revocation Confirmation Modal */}
      <ActionModal
        isOpen={isRevokeModalOpen}
        onOpenChange={(open) => {
          setIsRevokeModalOpen(open);
          if (!open) setUserToRevoke(null);
        }}
        title="Revoke User Sessions"
        description={`Are you sure you want to revoke all active sessions for ${userToRevoke?.email}? The user will be forced to log in again.`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <AlertCircle className="h-10 w-10" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              This action will immediately invalidate all refresh tokens for
              this user. They will be disconnected from all active devices.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsRevokeModalOpen(false)}
              disabled={isPending}
              className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRevoke}
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl px-6 shadow-lg shadow-rose-600/20 border-none"
            >
              {isPending ? "Revoking..." : "Revoke All Sessions"}
            </Button>
          </div>
        </div>
      </ActionModal>
    </div>
  );
}
