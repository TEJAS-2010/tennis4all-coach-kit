import { PlannerApp } from "@/components/planner-app";

export default function Home() {
  return (
    <>
      <header className="no-print border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <p className="font-mono text-xs tracking-[0.18em] text-neon uppercase">
            Tennis4All
          </p>
          <p className="text-right text-xs text-muted">The Tennis Lab, Dubai</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
        <div className="no-print mb-8 max-w-2xl">
          <h1 className="text-4xl leading-none font-semibold tracking-tight sm:text-5xl">
            Twenty kids.
            <br />
            Six rackets.
            <br />
            One court.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Tennis4All Coach Kit writes a session a new volunteer can run: warm-up,
            drills, a game, and a cool-down, fitted to the rackets, balls, cones,
            and space that are actually there.
          </p>
        </div>
        <PlannerApp />
      </main>
      <footer className="no-print border-t border-line">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8 text-sm leading-6 text-muted sm:grid-cols-2">
          <p>
            Built by Tejas Gupta for Tennis4All, The Tennis Lab&apos;s programme
            that collects used rackets, balls, and shoes for kids who cannot
            afford them.{" "}
            <a className="text-fg underline" href="https://rallymate.me">
              rallymate.me
            </a>
            {" · "}
            <a
              className="text-fg underline"
              href="https://the-tennislab.com/tennis4all"
            >
              the-tennislab.com/tennis4all
            </a>
          </p>
          <p>
            This is a starting point, not a qualified coach, and it has not been
            tested with NGO coaches yet. Do not enter children&apos;s names. The
            app was built with AI coding assistance. Plans marked AI Gateway are
            written by a model through the Vercel AI Gateway, then checked by the
            rules in this repo. Plans marked Offline planner never call a model.
          </p>
        </div>
      </footer>
    </>
  );
}
