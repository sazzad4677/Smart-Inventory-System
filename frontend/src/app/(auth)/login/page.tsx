"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Mail, ArrowRight, Zap } from "lucide-react";

import { UserLoginSchema, UserLoginInput } from "@/lib/validations";
import { loginAction } from "@/actions/auth.actions";
import { DynamicForm, FieldConfig } from "@/components/shared/dynamic-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const loginFields: FieldConfig[] = [
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "jane@example.com",
    icon: Mail,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    icon: Lock,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(data: UserLoginInput) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(data);
      if (result.success) {
        toast.success("Logged in successfully!");
        router.push("/dashboard");
      } else {
        const errorMessage = result.error || "Login failed";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  }

  const handleDemoLogin = (role: "Admin" | "Manager") => {
    const credentials = {
      Admin: { email: "admin@demo.com", password: "admin123" },
      Manager: { email: "manager@demo.com", password: "manager123" },
    };
    onSubmit(credentials[role]);
  };

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
      <div className="mb-8 text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20 mb-4">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Welcome back
        </h1>
        <p className="text-slate-400">
          Enter your credentials to manage your inventory
        </p>
      </div>

      <Card className="border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-white">
            Sign In
          </CardTitle>
          <CardDescription className="text-slate-500">
            Access your dashboard and reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicForm
            schema={UserLoginSchema}
            defaultValues={{ email: "", password: "" }}
            fields={loginFields}
            onSubmit={onSubmit}
            submitText="Sign In to Dashboard"
            isPending={isPending}
          />

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              onClick={() => handleDemoLogin("Admin")}
              disabled={isPending}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-white/5 bg-indigo-500/5 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 transition-all rounded-xl py-6 text-xs font-bold",
              )}
            >
              Admin Demo
            </Button>
            <Button
              onClick={() => handleDemoLogin("Manager")}
              disabled={isPending}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-white/5 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 transition-all rounded-xl py-6 text-xs font-bold",
              )}
            >
              Manager Demo
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-white/5 pt-6 bg-transparent">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase px-2">
              <span className="bg-slate-950/20 text-slate-500 font-medium tracking-wider">
                New to SmartInv?
              </span>
            </div>
          </div>

          <a
            href="/signup"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2",
            )}
          >
            Create an account <ArrowRight className="h-4 w-4" />
          </a>
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Smart Inventory System. All rights
        reserved.
      </p>
    </div>
  );
}
