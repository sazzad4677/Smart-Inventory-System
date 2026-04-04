"use client";

import { ReactNode, ReactElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ActionModalProps {
  trigger?: ReactElement;
  title: string;
  description?: string;
  children: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function ActionModal({
  trigger,
  title,
  description,
  children,
  isOpen,
  onOpenChange,
  className,
}: ActionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent
        className={cn(
          "sm:max-w-[450px] bg-slate-950/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(79,70,229,0.2)] dark",
          className,
        )}
      >
        <DialogHeader className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <DialogTitle className="text-2xl font-bold tracking-tight text-white">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-slate-400 text-[15px] leading-relaxed">
                {description}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>
        <div className="mt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
