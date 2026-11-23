"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ROUTES } from "@/app/constants/routes";

type Props = React.ComponentProps<typeof Button> & { label?: string };

/** Logs into the shared demo account with sample journals, no sign-up needed. */
export function DemoButton({ label = "Try the live demo", ...props }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    try {
      await api.post(ROUTES.USER.DEMO);
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      toast.error((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <Button onClick={start} disabled={loading} {...props}>
      <Sparkles /> {loading ? "Opening demo…" : label}
    </Button>
  );
}
