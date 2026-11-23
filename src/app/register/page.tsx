"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { DemoButton } from "@/components/DemoButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { ROUTES } from "../constants/routes";

type RegisterInput = { fullName: string; email: string; password: string };

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<RegisterInput>();

  const onSubmit = async (values: RegisterInput) => {
    setLoading(true);
    try {
      const { requiresVerification } = await api.post<{ requiresVerification: boolean }>(ROUTES.USER.REGISTER, values);
      if (requiresVerification) {
        setCheckEmail(values.email);
      } else {
        // No email step configured: log straight in.
        await api.post(ROUTES.USER.LOGIN, { email: values.email, password: values.password });
        toast.success("Welcome to Nomad Journal!");
        router.push(ROUTES.DASHBOARD);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <AuthShell title="Check your inbox" description={`We sent a verification link to ${checkEmail}.`}>
        <div className="grid justify-items-center gap-4 text-center">
          <MailCheck className="text-primary size-10" />
          <p className="text-muted-foreground text-sm">Open the link to activate your account, then log in.</p>
          <Button asChild className="w-full">
            <Link href="/login">Go to log in</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account" description="Start keeping journals of your trips and days.">
      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" autoComplete="name" minLength={2} maxLength={50} {...register("fullName")} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" minLength={8} {...register("password")} required />
            <span className="text-muted-foreground text-xs">At least 8 characters.</span>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <span className="bg-border h-px flex-1" /> or <span className="bg-border h-px flex-1" />
        </div>
        <DemoButton variant="outline" className="w-full" label="Explore the demo first" />

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-medium underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
