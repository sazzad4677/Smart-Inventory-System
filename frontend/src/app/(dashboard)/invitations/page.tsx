"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Mail,
  Shield,
  Trash2,
  Send,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import {
  inviteUserAction,
  getInvitationsAction,
  revokeInvitationAction,
} from "@/actions/invitation.actions";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/shared/app-select";
import { UserRole, UserRoleType } from "@/lib/validations";
import { cn } from "@/lib/utils";

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

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRoleType>(UserRole.Manager);

  const fetchInvitations = React.useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    const data = await getInvitationsAction();
    setInvitations(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchInvitations(false);
    };
    init();
  }, [fetchInvitations]);

  const handleInvite = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");

    startTransition(async () => {
      const result = await inviteUserAction({ email, role });
      if (result) {
        toast.success("Invitation sent successfully");
        setEmail("");
        fetchInvitations();
      }
    });
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;

    try {
      await revokeInvitationAction(id);
      toast.success("Invitation revoked");
      fetchInvitations();
    } catch {
      toast.error("Failed to revoke invitation");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Invitations"
        description="Invite new users to the system and manage pending invitations."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invite Form */}
        <Card className="lg:col-span-1 border-white/5 bg-slate-900/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="h-4 w-4 text-indigo-400" />
              Invite User
            </CardTitle>
            <CardDescription>
              Send a unique signup link via email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  className="bg-slate-950/50 border-white/10 text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-500" />
                  Assign Role
                </label>
                <AppSelect
                  options={[
                    { label: "Administrator", value: UserRole.Admin },
                    { label: "Manager", value: UserRole.Manager },
                  ]}
                  value={role}
                  onValueChange={(val) => setRole(val as UserRoleType)}
                  triggerClassName="bg-slate-950/50 border-white/10"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                disabled={isPending || !email}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Invite...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Invitations List */}
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
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-slate-500">
                <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm animate-pulse">Loading invitations...</p>
              </div>
            ) : invitations.length === 0 ? (
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
                      key={invite._id}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRevoke(invite._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
