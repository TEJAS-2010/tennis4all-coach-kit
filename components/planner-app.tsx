"use client";

import { useState, useTransition } from "react";

import { PlanView } from "@/components/plan-view";
import { SessionForm } from "@/components/session-form";
import { defaultInput } from "@/lib/presets";
import { sessionInputSchema } from "@/lib/schema";
import type { SessionInput, SessionPlan } from "@/lib/types";

export function PlannerApp() {
  const [value, setValue] = useState<SessionInput>(defaultInput);
  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const [paper, setPaper] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    const parsed = sessionInputSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the session details.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        const body = (await response.json()) as SessionPlan & { error?: string };
        if (!response.ok) {
          setError(body.error ?? "The plan could not be built.");
          return;
        }
        setPlan(body);
        setPaper(false);
        requestAnimationFrame(() => {
          document.getElementById("session-plan")?.focus();
          document.getElementById("session-plan")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      } catch {
        setError("The plan could not be built. Check the connection and try again.");
      }
    });
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="no-print lg:sticky lg:top-4">
        <SessionForm
          value={value}
          pending={pending}
          error={error}
          onChange={setValue}
          onSubmit={submit}
        />
      </div>
      <div aria-live="polite">
        {plan ? (
          <PlanView plan={plan} paper={paper} onPaperChange={setPaper} />
        ) : (
          <div className="no-print border border-dashed border-line p-6 text-sm leading-6 text-muted">
            <p className="font-mono text-[11px] tracking-[0.16em] text-neon uppercase">
              Waiting for a plan
            </p>
            <p className="mt-3">
              The form is set to 20 players, ages 8–12, with 6 rackets on a full
              court. Build that plan, or switch to the young Hindi group.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
