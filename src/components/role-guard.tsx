"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const currentUser = useQuery(api.users.getCurrentUser);
  const router = useRouter();

  // While loading, render nothing (avoid flash)
  if (currentUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // User not found in DB (upsert pending)
  if (currentUser === null) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const userRole = currentUser.role ?? "";
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            You don&apos;t have permission to view this page. This area requires one of the following
            roles:{" "}
            <span className="font-medium text-foreground">{allowedRoles.join(", ")}</span>.
          </p>
          <p className="text-xs text-muted-foreground">
            Your current role: <span className="font-medium text-foreground">{userRole || "Unknown"}</span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
