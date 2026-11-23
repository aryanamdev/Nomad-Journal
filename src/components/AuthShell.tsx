import Link from "next/link";
import { Logo } from "@/components/Logo";

export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="contours flex min-h-dvh flex-col items-center justify-center gap-8 px-5 py-10">
      <Link href="/" aria-label="Nomad Journal home">
        <Logo />
      </Link>
      <div className="bg-page w-full max-w-[26rem] rounded-lg border p-7 shadow-[0_24px_60px_-24px_rgb(29_43_54/0.35)] sm:p-9">
        <h1 className="font-display text-[2.4rem]">{title}</h1>
        <p className="font-story text-ink/75 mt-2 text-[1.05rem]">{description}</p>
        <div className="mt-7">{children}</div>
      </div>
    </main>
  );
}
