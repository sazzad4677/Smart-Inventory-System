import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600/10 text-indigo-400 border border-indigo-400/20 [a]:hover:bg-indigo-600/20 shadow-sm shadow-indigo-500/10",
        secondary:
          "bg-slate-800/40 text-slate-300 border border-white/5 [a]:hover:bg-slate-800/60",
        destructive:
          "bg-rose-500/10 text-rose-400 border border-rose-400/20 focus-visible:ring-rose-500/20 dark:focus-visible:ring-rose-500/40 [a]:hover:bg-rose-500/20 shadow-sm shadow-rose-500/10",
        outline:
          "border border-white/10 text-slate-400 hover:text-white [a]:hover:bg-white/5",
        ghost: "hover:bg-white/5 hover:text-white border border-transparent",
        link: "text-indigo-400 underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
