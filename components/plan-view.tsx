import { tx, type Language, type PlanChange, type SessionPlan, type Station } from "@/lib/types";

const kindLabel = {
  warmup: { en: "Warm-up", hi: "वार्म-अप" },
  drill: { en: "Drill", hi: "ड्रिल" },
  game: { en: "Game", hi: "खेल" },
  cooldown: { en: "Cool-down", hi: "कूल-डाउन" },
} as const;

const changeLabel: Record<string, { en: string; hi: string }> = {
  "under8-overhead": { en: "Overhead drill removed", hi: "ओवरहेड ड्रिल हटी" },
  "under8-intensity": { en: "Intensity lowered", hi: "मेहनत हल्की की" },
  "under8-elimination": { en: "Elimination removed", hi: "एलिमिनेशन हटा" },
  "under8-underarm": { en: "Under-8 serve rule added", hi: "8 से छोटे खिलाड़ियों का सर्व नियम" },
  "under8-easy": { en: "Easy-effort rule added", hi: "हल्की मेहनत का नियम" },
  "youth-fitness": { en: "No fitness test", hi: "फिटनेस टेस्ट नहीं" },
  hydration: { en: "Water break added", hi: "पानी की ब्रेक" },
  heat: { en: "Heat break added", hi: "गर्मी की ब्रेक" },
  ground: { en: "Ground check added", hi: "मैदान की जाँच" },
  road: { en: "Road safety added", hi: "सड़क की सुरक्षा" },
  carry: { en: "Racket-carry rule added", hi: "रैकेट लेकर चलने का नियम" },
  spacing: { en: "Spacing rule added", hi: "दूरी का नियम" },
  "group-gap": { en: "Gap between groups added", hi: "समूहों के बीच जगह" },
  "mixed-age": { en: "Mixed-age note added", hi: "मिली-जुली उम्र का नोट" },
  timings: { en: "Times adjusted", hi: "समय बदला" },
  "kit-rotation": { en: "Station rotation applied", hi: "स्टेशन की बारी लगाई" },
};

type PlanViewProps = {
  plan: SessionPlan;
  paper: boolean;
  onPaperChange: (paper: boolean) => void;
};

export function PlanView({ plan, paper, onPaperChange }: PlanViewProps) {
  const language = plan.language;
  const total = plan.blocks.reduce((sum, block) => sum + block.minutes, 0);
  const sheet = paper
    ? "border-neutral-300 bg-white text-neutral-950"
    : "border-line bg-bg text-fg";

  return (
    <article id="session-plan" className={`plan-sheet border p-4 sm:p-6 ${sheet}`} tabIndex={-1}>
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="border border-current px-3 py-2 text-sm"
          onClick={() => window.print()}
        >
          Print or save as PDF
        </button>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={paper}
            onChange={(event) => onPaperChange(event.target.checked)}
          />
          Paper view
        </label>
      </div>

      <p className="font-mono text-[11px] tracking-[0.16em] uppercase">
        Mode: {plan.source === "ai-gateway" ? "AI Gateway" : "Offline planner"}
        {plan.model ? ` · ${plan.model}` : ""}
      </p>
      <p className={`mt-1 text-sm leading-6 ${paper ? "text-neutral-700" : "text-muted"} print:text-black`}>
        {plan.sourceNote}
      </p>

      <header className="mt-5 border-t border-current/20 pt-4">
        <h2 className="text-2xl leading-tight font-semibold tracking-tight">{plan.title}</h2>
        <p className="mt-1 font-mono text-xs uppercase">
          {total} minutes · {plan.blocks.length} blocks
        </p>
        <p className="mt-3 text-sm leading-6">{plan.summary}</p>
      </header>

      <section className="mt-6">
        <h3 className="font-mono text-[11px] tracking-[0.16em] uppercase">
          {text(language, "Kit check", "किट जाँच")}
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {plan.kit.stations.map((station) => (
            <li key={station.name} className="border border-current/20 p-3">
              <p className="text-sm font-semibold">{station.name}</p>
              <p className="mt-1 font-mono text-[11px] uppercase">
                {station.players} {text(language, "players", "खिलाड़ी")}
                {equipment(station, language)}
              </p>
              <p className="mt-2 text-sm leading-5">{station.detail}</p>
            </li>
          ))}
        </ul>
        {plan.kitAdjustments.length > 0 ? (
          <ChangeList
            title={text(language, "What the kit check rewrote", "किट जाँच ने क्या बदला")}
            changes={plan.kitAdjustments}
            language={language}
          />
        ) : (
          <p className="mt-3 text-sm leading-6">
            {plan.kit.needsRotation
              ? text(
                  language,
                  "The plan was already built around station rotation. Waiting players are not handed a racket.",
                  "योजना पहले से स्टेशन की बारी पर बनी है। इंतज़ार कर रहे खिलाड़ियों को रैकेट नहीं दिया जाता।",
                )
              : text(
                  language,
                  "Every player on court can hold a racket, and the space can take them.",
                  "कोर्ट पर हर खिलाड़ी रैकेट पकड़ सकता है, और जगह काफी है।",
                )}
          </p>
        )}
      </section>

      <section className="mt-6">
        <h3 className="font-mono text-[11px] tracking-[0.16em] uppercase">
          {text(language, "Safety filter", "सुरक्षा फ़िल्टर")}
        </h3>
        <p className="mt-2 text-sm leading-6">
          {plan.safetyPassed
            ? text(
                language,
                "Passed. These rules ran after the plan was written.",
                "पास। ये नियम योजना लिखे जाने के बाद चले।",
              )
            : text(
                language,
                "Needs a coach to read the flagged items before this plan is used.",
                "इस योजना को इस्तेमाल करने से पहले कोच को चिह्नित बातें पढ़नी होंगी।",
              )}
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {plan.safetyBrief.map((item) => (
            <li key={item.id} className="border border-current/20 p-3">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-1 text-sm leading-5">{item.detail}</p>
            </li>
          ))}
        </ul>
        <ChangeList
          title={text(language, "What it changed", "इसने क्या बदला")}
          changes={plan.safetyChanges}
          language={language}
          empty={text(
            language,
            "Nothing. The plan already matched the safety rules.",
            "कुछ नहीं। योजना सुरक्षा नियमों पर पहले से खरी थी।",
          )}
        />
      </section>

      <ol className="block-grid mt-6 grid gap-3">
        {plan.blocks.map((block, index) => (
          <li key={`${block.kind}-${index}`} className="block-card border border-current/20 p-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase">
                {tx(language, kindLabel[block.kind])}
              </p>
              <p className="font-mono text-sm">{block.minutes} min</p>
            </div>
            <h4 className="mt-1 text-base font-semibold">{block.title}</h4>
            <p className="mt-2 text-sm leading-6">{block.setup}</p>
            <p className="mt-2 text-sm leading-6">
              <span className="font-semibold">{text(language, "Organisation. ", "व्यवस्था। ")}</span>
              {block.organization}
            </p>
            <p className="mt-2 text-sm leading-6">
              <span className="font-semibold">{text(language, "Say: ", "कहें: ")}</span>
              {block.coachingCues.join(" ")}
            </p>
            <ul className="mt-2 list-disc pl-4 text-sm leading-6">
              {block.safetyNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </article>
  );
}

function ChangeList({
  title,
  changes,
  language,
  empty,
}: {
  title: string;
  changes: PlanChange[];
  language: Language;
  empty?: string;
}) {
  return (
    <div className="mt-3">
      <h4 className="text-sm font-semibold">{title}</h4>
      {changes.length === 0 ? (
        <p className="mt-1 text-sm leading-6">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {changes.map((change, index) => (
            <li key={`${change.code}-${change.blockTitle}-${index}`} className="text-sm leading-5">
              <span className="font-semibold">
                {changeLabel[change.code]
                  ? tx(language, changeLabel[change.code])
                  : change.code}
                {change.action === "flagged" ? ` · ${text(language, "flagged", "चिह्नित")}` : ""}
                .
              </span>{" "}
              {change.detail}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function equipment(station: Station, language: Language): string {
  const parts: string[] = [];
  if (station.rackets > 0) {
    parts.push(`${station.rackets} ${text(language, "rackets", "रैकेट")}`);
  }
  if (station.balls > 0) {
    parts.push(`${station.balls} ${text(language, "balls", "गेंदें")}`);
  }
  if (station.cones > 0) {
    parts.push(`${station.cones} ${text(language, "cones", "कोन")}`);
  }
  if (parts.length === 0) return "";
  return ` · ${parts.join(" · ")}`;
}

function text(language: Language, en: string, hi: string): string {
  return tx(language, { en, hi });
}
