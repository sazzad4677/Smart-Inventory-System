import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-2 pb-2">
      <div className="grid gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="text-slate-400 text-lg max-w-[700px] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
