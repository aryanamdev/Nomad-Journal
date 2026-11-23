import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { DemoButton } from "@/components/DemoButton";
import { RouteIllustration } from "@/components/landing/RouteIllustration";

const STEPS = [
  {
    title: "Write it on the day",
    text: "A title, what happened, how it felt and what the weather did. Tag it so you can find it again.",
  },
  {
    title: "Pin where it happened",
    text: "Search a place or tap the map. Each journal's stops join up into a route you can retrace later.",
  },
  {
    title: "Look back three ways",
    text: "Read a trip as a timeline, see it laid out on a calendar, or follow the route across the map.",
  },
];

export default async function Home() {
  const loggedIn = Boolean((await cookies()).get("token")?.value);

  return (
    <div className="min-h-dvh">
      <div className="contours">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Logo />
          <nav className="flex items-center gap-1">
            {loggedIn ? (
              <Button asChild>
                <Link href="/dashboard">Open my journals</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild variant="outline" className="bg-page">
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            )}
          </nav>
        </header>

        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pt-8 pb-20 md:grid-cols-[1.1fr_1fr] md:pt-16 md:pb-28">
          <div>
            <h1 className="font-display text-ink text-[3.6rem] text-balance sm:text-[5.2rem] lg:text-[6.2rem]">
              Every trip, written down where it happened.
            </h1>
            <p className="font-story text-ink/85 mt-7 max-w-[34rem] text-xl leading-relaxed">
              Nomad Journal is a travel diary that keeps your stories tied to the places they happened, so a trip reads
              like a route, not a pile of notes.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <DemoButton size="lg" className="h-12 px-6 text-base" label="Open the demo journal" />
              <Button asChild size="lg" variant="ghost" className="h-12 px-4 text-base">
                <Link href={loggedIn ? "/dashboard" : "/register"}>{loggedIn ? "Open my journals" : "Start your own"}</Link>
              </Button>
            </div>
            <p className="text-muted-foreground mt-3 text-sm">The demo is a sample journal you can explore and edit. No sign-up.</p>
          </div>

          <div className="mx-auto w-full max-w-[520px]">
            <RouteIllustration />
          </div>
        </section>
      </div>

      <section className="border-y bg-[#e3e9e2]">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="bg-page overflow-hidden rounded-lg border shadow-[0_30px_80px_-30px_rgb(29_43_54/0.45)]">
            <Image
              src="/screenshots/dashboard.png"
              alt="The Nomad Journal dashboard showing journals on the left, a timeline of entries in the middle and an open entry with a map on the right"
              width={2880}
              height={1800}
              priority
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="font-display max-w-2xl text-5xl text-balance">Three things, done carefully</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.title} className="border-ink border-t-2 pt-5">
              <h3 className="text-xl font-semibold">{s.title}</h3>
              <p className="font-story text-ink/80 mt-2 text-lg leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="text-muted-foreground border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>
            Designed and built by{" "}
            <a href="https://aryannamdev.online" className="text-ink underline underline-offset-4">
              Aryan Namdev
            </a>
          </span>
          <nav className="flex gap-5">
            <a href="https://github.com/aryanamdev/Nomad-Journal" className="hover:text-ink">
              Source code
            </a>
            <a href="/api-docs" className="hover:text-ink">
              API reference
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
