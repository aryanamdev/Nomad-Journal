"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AuthShell } from "@/components/AuthShell";
import { DemoButton } from "@/components/DemoButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { ROUTES } from "../constants/routes";

type LoginInput = { email: string; password: string };

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<LoginInput>();

  const onSubmit = async (values: LoginInput) => {
    setLoading(true);
    try {
      await api.post(ROUTES.USER.LOGIN, values);
      // Only follow same-site paths.
      router.push(next?.startsWith("/") && !next.startsWith("//") ? next : ROUTES.DASHBOARD);
    } catch (err) {
      toast.error((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" /> or <span className="bg-border h-px flex-1" />
      </div>
      <DemoButton variant="outline" className="w-full" label="Explore the demo instead" />

      <p className="text-center text-sm">
        New here?{" "}
        <Link href="/register" className="font-medium underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" description="Log in to your journals.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
