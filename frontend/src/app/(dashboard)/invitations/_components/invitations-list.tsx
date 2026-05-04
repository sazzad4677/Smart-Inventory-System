"use client";

import React, { useEffect, useState, useTransition, useCallback } from "react";
import {
  Mail,
  Shield,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  getInvitationsAction,
  revokeInvitationAction,
} from "@/actions/invitation.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/shared/action-modal";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Invitation {
  _id: string;
  email: string;
  role: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
  invitedBy?: {
    email: string;
  };
}

interface InvitationsListProps {
  refreshTrigger?: number;
}

export function InvitationsList({ refreshTrigger }: InvitationsListProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isRevoking, startRevokeTransition] = useTransition();

  const fetchInvitations = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await getInvitationsAction();
      setInvitations(data);
    } catch {
      toast.error("Failed to fetch invitations");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations(true);
  }, [fetchInvitations, refreshTrigger]);

  const handleRevoke = async () => {
    if (!revokingId) return;

    startRevokeTransition(async () => {
      const result = await revokeInvitationAction(revokingId);
      if (result.success) {
        toast.success("Invitation revoked successfully");
        setRevokingId(null);
        fetchInvitations();
      } else {
        toast.error(result.error || "Failed to revoke invitation");
      }
    });
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-2 border-white/5 bg-slate-900/40 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 bg-white/5" />
              <Skeleton className="h-4 w-64 bg-white/5" />
            </div>
            <Skeleton className="h-9 w-9 bg-white/5" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40 bg-white/10" />
                  <Skeleton className="h-3 w-20 bg-white/10" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 border-white/5 bg-slate-900/40 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Recent Invitations</CardTitle>
          <CardDescription>
            Track the status of sent invitations.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white hover:bg-white/5"
          onClick={() => fetchInvitations()}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn("h-4 w-4", isRefreshing && "animate-spin")}
          />
        </Button>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
            <Mail className="mx-auto h-10 w-10 text-slate-600 mb-4 opacity-20" />
            <p className="text-slate-400 font-medium">
              No invitations sent yet
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Start by inviting your first user.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((invite) => {
              const isExpired = new Date(invite.expiresAt) < new Date();
              return (
                <div
                  key={invite.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/5"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center relative",
                        invite.used
                          ? "bg-emerald-500/10 text-emerald-500"
                          : isExpired
                            ? "bg-rose-500/10 text-rose-500"
                            : "bg-indigo-500/10 text-indigo-400",
                      )}
                    >
                      <Mail className="h-5 w-5" />
                      <div
                        className={cn(
                          "absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-900",
                          invite.used
                            ? "bg-emerald-500"
                            : isExpired
                              ? "bg-rose-500"
                              : "bg-indigo-500 animate-pulse",
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white truncate max-w-[180px] sm:max-w-none">
                        {invite.email}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                          <Shield className="h-2.5 w-2.5" />
                          {invite.role}
                        </span>
                        {invite.used ? (
                          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Used
                          </span>
                        ) : isExpired ? (
                          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-rose-400">
                            <XCircle className="h-2.5 w-2.5" /> Expired
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-indigo-400">
                            <Clock className="h-2.5 w-2.5" /> Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 mt-4 sm:mt-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Expires
                      </p>
                      <p className="text-xs text-slate-300 font-medium font-mono">
                        {new Date(invite.expiresAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {!invite.used && (
                      <ActionModal
                        title="Revoke Invitation"
                        description={`Are you sure you want to revoke the invitation for ${invite.email}? This action cannot be undone.`}
                        isOpen={revokingId === invite.id}
                        onOpenChange={(open) =>
                          setRevokingId(open ? invite.id : null)
                        }
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 sm:scale-100 scale-100 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <div className="flex flex-col gap-4">
                          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex gap-3">
                            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                            <p className="text-sm text-rose-200/80 leading-relaxed">
                              Revoking this invitation will immediately
                              invalidate the sign-up link sent to the user.
                            </p>
                          </div>
                          <div className="flex gap-3 mt-2">
                            <Button
                              variant="ghost"
                              className="flex-1 text-white hover:bg-white/5 border border-white/5"
                              onClick={() => setRevokingId(null)}
                              disabled={isRevoking}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                              onClick={handleRevoke}
                              disabled={isRevoking}
                            >
                              {isRevoking ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Revoking...
                                </>
                              ) : (
                                "Revoke Access"
                              )}
                            </Button>
                          </div>
                        </div>
                      </ActionModal>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
