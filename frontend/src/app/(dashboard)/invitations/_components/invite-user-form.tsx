"use client";

import React, { useState, useTransition } from "react";
import { Mail, Shield, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { inviteUserAction } from "@/actions/invitation.actions";
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

interface InviteUserFormProps {
  onSuccess?: () => void;
}

export function InviteUserForm({ onSuccess }: InviteUserFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRoleType>(UserRole.Manager);
  const [isPending, startTransition] = useTransition();

  const handleInvite = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");

    startTransition(async () => {
      const result = await inviteUserAction({ email, role });

      if (result.success) {
        toast.success("Invitation sent successfully");
        setEmail("");
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || "Failed to send invitation");
      }
    });
  };

  return (
    <Card className="lg:col-span-1 border-white/5 bg-slate-900/40 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Send className="h-4 w-4 text-indigo-400" />
          Invite User
        </CardTitle>
        <CardDescription>Send a unique signup link via email.</CardDescription>
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
  );
}
