import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex w-full min-w-0 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 rounded-xl transition-all outline-none focus-visible:border-indigo-500 focus-visible:ring-3 focus-visible:ring-indigo-500/20 disabled:opacity-50 aria-invalid:border-destructive h-11 px-4",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
