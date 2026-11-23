import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { BookOpen, CalendarDays, Map, Search, Smile, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { DemoButton } from "@/components/DemoButton";

const FEATURES = [
  { icon: BookOpen, title: "A journal per trip", text: "Keep each trip, season or theme in its own colour-coded journal." },
  { icon: Map, title: "See it on a map", text: "Pin entries to the places they happened and retrace the whole route." },
  { icon: CalendarDays, title: "Calendar view", text: "Spot streaks and gaps at a glance, month by month." },
  { icon: Smile, title: "Mood and weather", text: "Capture how a day felt, not just what happened." },
  { icon: Tags, title: "Tags", text: "Group moments across journals: #food, #hiking, #sunsets." },
  { icon: Search, title: "Search everything", text: "Find any entry by title, story, place or tag in a keystroke." },
];

export default async function Home() {
  const loggedIn = Boolean((await cookies()).get("token")?.value);

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          {loggedIn ? (
            <Button asChild>
              <Link href="/dashboard">Open my journals</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-3xl gap-6 px-6 pt-14 pb-12 text-center sm:pt-20">
          <p className="text-primary text-sm font-medium">A travel journal for people who wander</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Remember every trip, not just the photos.
          </h1>
          <p className="text-muted-foreground mx-auto max-w-xl text-lg text-pretty">
            Nomad Journal keeps your stories, places, moods and weather together, so you can browse a trip as a list, a
            calendar or a map.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <DemoButton size="lg" />
            <Button asChild size="lg" variant="outline">
              <Link href={loggedIn ? "/dashboard" : "/register"}>{loggedIn ? "Open my journals" : "Create a free account"}</Link>
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">The demo opens a sample account. No sign-up needed.</p>
        </section>

        <section className="mx-auto max-w-6xl px-6">
          <div className="bg-muted/40 overflow-hidden rounded-2xl border p-2 shadow-xl shadow-black/5">
            <Image
              src="/screenshots/dashboard.png"
              alt="The Nomad Journal dashboard: journals on the left, a map of entries in the middle and an entry's details on the right"
              width={2400}
              height={1400}
              className="rounded-xl border"
              priority
            />
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Everything a trip leaves behind, in one place</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-card rounded-xl border p-6">
                <Icon className="text-primary mb-4 size-6" />
                <h3 className="font-medium">{title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t px-6 py-8 text-sm sm:flex-row">
        <span>
          Built by{" "}
          <a href="https://aryannamdev.online" className="hover:text-foreground underline underline-offset-4">
            Aryan Namdev
          </a>
        </span>
        <nav className="flex gap-4">
          <a href="https://github.com/aryanamdev/Nomad-Journal" className="hover:text-foreground">
            Source on GitHub
          </a>
          <a href="/api-docs" className="hover:text-foreground">
            API docs
          </a>
        </nav>
      </footer>
    </div>
  );
}
