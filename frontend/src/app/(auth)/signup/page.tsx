"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Mail, ShieldCheck, ArrowLeft, UserPlus } from "lucide-react";

import { UserSignupSchema, UserSignupInput, UserRole } from "@/lib/validations";
import { signupAction } from "@/actions/auth.actions";
import { DynamicForm, FieldConfig } from "@/components/shared/dynamic-form";
import { useAuthStore } from "@/store/auth.store";

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
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    icon: Lock,
  },
  {
    name: "role",
    label: "Account Role",
    type: "select",
    placeholder: "Select your role",
    icon: ShieldCheck,
    options: [
      { label: "Administrator", value: UserRole.Admin },
      { label: "Manager", value: UserRole.Manager },
    ],
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  async function onSubmit(data: UserSignupInput) {
    setError(null);
    startTransition(async () => {
      const result = await signupAction(data);
      if (result.success) {
        setUser(result.data.user);
        toast.success("Account created successfully!");
        router.push("/dashboard");
      } else {
        const errorMessage = result.error || "Signup failed";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  }

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
      <div className="mb-8 text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20 mb-4">
          <UserPlus className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Create Account
        </h1>
        <p className="text-slate-400">
          Join the smart inventory management system
        </p>
      </div>

      <Card className="border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-white">
            Register
          </CardTitle>
          <CardDescription className="text-slate-500">
            Set up your credentials and role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicForm
            schema={UserSignupSchema}
            defaultValues={{
              email: "",
              password: "",
              role: UserRole.Manager,
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
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase px-2">
              <span className="bg-slate-950/20 text-slate-500 font-medium tracking-wider">
                Already have an account?
              </span>
            </div>
          </div>

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

      <p className="mt-8 text-center text-sm text-slate-500">
        By signing up, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
}
