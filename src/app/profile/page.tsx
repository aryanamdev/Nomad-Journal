"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/entryMeta";
import { ROUTES } from "@/app/constants/routes";
import { useJournalStore } from "@/store/useJournalStore";
import type { User } from "@/types/user";

export default function ProfilePage() {
  const router = useRouter();
  const reset = useJournalStore((s) => s.reset);
  const [me, setMe] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<User>(ROUTES.USER.VIEWER)
      .then((user) => {
        setMe(user);
        setFullName(user.fullName);
        setBio(user.bio ?? "");
      })
      .catch((err: Error) => toast.error(err.message));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.patch<User>(ROUTES.USER.VIEWER, { fullName: fullName.trim(), bio });
      setMe(updated);
      toast.success("Profile saved");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await api.post(ROUTES.USER.LOGOUT).catch(() => {});
    reset();
    toast.success("Logged out");
    router.push("/");
  };

  const dirty = me && (fullName.trim() !== me.fullName || bio !== (me.bio ?? ""));

  return (
    <main className="mx-auto grid max-w-xl gap-4 p-4 py-10">
      <Button asChild variant="ghost" size="sm" className="justify-self-start">
        <Link href="/dashboard">
          <ArrowLeft /> Back to journals
        </Link>
      </Button>

      <Card>
        <form onSubmit={save}>
          <CardHeader className="flex flex-row items-center gap-4">
            <span className="bg-primary/10 text-primary grid size-14 shrink-0 place-items-center rounded-full text-xl font-semibold">
              {me?.fullName?.[0]?.toUpperCase() ?? "…"}
            </span>
            <div className="min-w-0">
              <CardTitle className="truncate">{me?.fullName ?? "Loading…"}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                {me?.email}
                {me?.isVerified && <CheckCircle2 className="size-3.5 text-green-600" aria-label="Verified" />}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="mt-6 grid gap-4">
            {me?.isDemo && (
              <p className="bg-muted rounded-md p-3 text-sm">
                This is the shared demo account, so the profile can&apos;t be edited.{" "}
                <Link href="/register" className="font-medium underline underline-offset-4">
                  Create your own account
                </Link>{" "}
                to keep your journals.
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                minLength={2}
                maxLength={50}
                disabled={!me || me.isDemo}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="Where are you headed next?"
                disabled={!me || me.isDemo}
              />
              <span className="text-muted-foreground text-right text-xs">{bio.length}/200</span>
            </div>
            {me?.createdAt && <p className="text-muted-foreground text-xs">Member since {formatDate(me.createdAt)}</p>}
          </CardContent>

          <CardFooter className="mt-6 flex justify-between gap-2 border-t pt-6">
            <Button type="button" variant="outline" onClick={logout}>
              <LogOut /> Log out
            </Button>
            <Button type="submit" disabled={!dirty || saving || me?.isDemo}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
