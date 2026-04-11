"use client";

import { useTransition, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Lock, Mail, ArrowLeft, UserPlus, Info } from "lucide-react";

import { UserSignupSchema, UserSignupInput } from "@/lib/validations";
import { signupAction } from "@/actions/auth.actions";
import { DynamicForm, FieldConfig } from "@/components/shared/dynamic-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const signupFields: FieldConfig[] = [
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "jane@example.com",
    icon: Mail,
    disabled: true, // Email is fixed by invitation
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    icon: Lock,
  },
];

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  async function onSubmit(data: UserSignupInput) {
    if (!token) {
      toast.error("Invitation token is missing!");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await signupAction({ ...data, token, email });
      if (result.success) {
        toast.success("Account created successfully! Please sign in.");
        router.push("/login");
      } else {
        const errorMessage = result.error || "Signup failed";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  }

  if (!token) {
    return (
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <Card className="border-rose-500/20 bg-slate-900/40 backdrop-blur-xl shadow-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
              <Info className="h-6 w-6 text-rose-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Invite Only
            </CardTitle>
            <CardDescription className="text-slate-400">
              Registration is currently restricted. You need a valid invitation
              link to create an account.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <a
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full text-slate-400 hover:text-white",
              )}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sign In
            </a>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
      <div className="mb-8 text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20 mb-4">
          <UserPlus className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Complete Registration
        </h1>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          Invite Only
        </div>
      </div>

      <Card className="border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-white">
            Register
          </CardTitle>
          <CardDescription className="text-slate-500">
            Create your password to join the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicForm
            schema={UserSignupSchema}
            defaultValues={{
              email: email,
              password: "",
              token: token,
            }}
            fields={signupFields}
            onSubmit={onSubmit}
            submitText="Create Account"
            isPending={isPending}
          />
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-white/5 pt-6 bg-transparent">
          <a
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2",
            )}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
