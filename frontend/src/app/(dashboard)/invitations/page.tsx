"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { InviteUserForm } from "./_components/invite-user-form";
import { InvitationsList } from "./_components/invitations-list";

export default function InvitationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshList = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Invitations"
        description="Invite new users to the system and manage pending invitations."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invite Form */}
        <InviteUserForm onSuccess={handleRefreshList} />

        {/* Invitations List */}
        <InvitationsList refreshTrigger={refreshKey} />
      </div>
    </div>
  );
}
