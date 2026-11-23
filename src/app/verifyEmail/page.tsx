"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ROUTES } from "../constants/routes";

type Status = { state: "loading" | "ok" | "error"; message: string };

function VerifyEmail() {
  const token = useSearchParams().get("token");
  const [status, setStatus] = useState<Status>({ state: "loading", message: "Verifying your email…" });
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return; // avoid a double request in React strict mode
    sent.current = true;
    if (!token) {
      setStatus({ state: "error", message: "This link is missing its verification token." });
      return;
    }
    api
      .post(ROUTES.USER.VERIFY_EMAIL, { token })
      .then(() => setStatus({ state: "ok", message: "Your email is verified. You can log in now." }))
      .catch((err: Error) => setStatus({ state: "error", message: err.message }));
  }, [token]);

  const Icon = status.state === "loading" ? Loader2 : status.state === "ok" ? CheckCircle2 : XCircle;

  return (
    <div className="grid justify-items-center gap-4 text-center">
      <Icon
        className={
          status.state === "loading"
            ? "text-muted-foreground size-10 animate-spin"
            : status.state === "ok"
              ? "size-10 text-green-600"
              : "text-destructive size-10"
        }
      />
      <p className="text-sm">{status.message}</p>
      {status.state !== "loading" && (
        <Button asChild className="w-full">
          <Link href={status.state === "ok" ? "/login" : "/register"}>
            {status.state === "ok" ? "Log in" : "Back to sign up"}
          </Link>
        </Button>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <AuthShell title="Email verification" description="Confirming your Nomad Journal account.">
      <Suspense>
        <VerifyEmail />
      </Suspense>
    </AuthShell>
  );
}
