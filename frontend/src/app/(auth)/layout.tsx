import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        <Suspense fallback={null}>{children}</Suspense>
      </div>
    </div>
  );
}
