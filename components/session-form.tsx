import type { ReactNode } from "react";

import { presets } from "@/lib/presets";
import type { Court, Language, Level, Minutes, SessionInput } from "@/lib/types";

type SessionFormProps = {
  value: SessionInput;
  pending: boolean;
  error: string | null;
  onChange: (value: SessionInput) => void;
  onSubmit: () => void;
};

const levels: Array<{ value: Level; label: string }> = [
  { value: "beginner", label: "Beginner" },
  { value: "developing", label: "Developing" },
  { value: "intermediate", label: "Intermediate" },
];

const courts: Array<{ value: Court; label: string }> = [
  { value: "full", label: "Full court" },
  { value: "half", label: "Half court" },
  { value: "wall", label: "Wall or open ground" },
];

const lengths: Minutes[] = [30, 45, 60, 90];

const languages: Array<{ value: Language; label: string }> = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
];

export function SessionForm({ value, pending, error, onChange, onSubmit }: SessionFormProps) {
  function update(patch: Partial<SessionInput>) {
    onChange({ ...value, ...patch });
  }

  return (
    <form
      className="border border-line p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="mb-4 flex flex-col gap-2">
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
          Try a session
        </p>
        <div className="flex flex-col gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="border border-line px-3 py-2 text-left hover:border-neon"
              onClick={() => onChange(preset.input)}
            >
              <span className="block text-sm font-medium text-fg">{preset.label}</span>
              <span className="block text-xs text-muted">{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          id="group-size"
          label="Group size"
          min={1}
          max={40}
          value={value.groupSize}
          onChange={(groupSize) => update({ groupSize })}
        />
        <NumberField
          id="rackets"
          label="Rackets"
          min={0}
          max={60}
          value={value.rackets}
          onChange={(rackets) => update({ rackets })}
        />
        <NumberField
          id="age-min"
          label="Youngest age"
          min={4}
          max={18}
          value={value.ageMin}
          onChange={(ageMin) => update({ ageMin })}
        />
        <NumberField
          id="age-max"
          label="Oldest age"
          min={4}
          max={18}
          value={value.ageMax}
          onChange={(ageMax) => update({ ageMax })}
        />
        <NumberField
          id="balls"
          label="Balls"
          min={0}
          max={80}
          value={value.balls}
          onChange={(balls) => update({ balls })}
        />
        <NumberField
          id="cones"
          label="Cones"
          min={0}
          max={40}
          value={value.cones}
          onChange={(cones) => update({ cones })}
        />
      </div>

      <ChoiceGroup legend="Level" name="level">
        {levels.map((level) => (
          <Choice
            key={level.value}
            name="level"
            label={level.label}
            checked={value.level === level.value}
            onSelect={() => update({ level: level.value })}
          />
        ))}
      </ChoiceGroup>
      <ChoiceGroup legend="Court space" name="court">
        {courts.map((court) => (
          <Choice
            key={court.value}
            name="court"
            label={court.label}
            checked={value.court === court.value}
            onSelect={() => update({ court: court.value })}
          />
        ))}
      </ChoiceGroup>
      <ChoiceGroup legend="Session length" name="minutes">
        {lengths.map((minutes) => (
          <Choice
            key={minutes}
            name="minutes"
            label={`${minutes} min`}
            checked={value.minutes === minutes}
            onSelect={() => update({ minutes })}
          />
        ))}
      </ChoiceGroup>
      <ChoiceGroup legend="Plan language" name="language">
        {languages.map((language) => (
          <Choice
            key={language.value}
            name="language"
            label={language.label}
            checked={value.language === language.value}
            onSelect={() => update({ language: language.value })}
          />
        ))}
      </ChoiceGroup>

      {error ? (
        <p className="mt-4 text-sm text-neon" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full bg-neon px-4 py-3 text-sm font-semibold text-ink disabled:opacity-60"
      >
        {pending ? "Building the plan…" : "Build the plan"}
      </button>
      <p className="mt-3 text-xs leading-5 text-muted">
        No sign-up and no names. If an AI Gateway key is configured, the plan is
        generated with it. Otherwise the offline planner runs, and the plan says
        which one it was.
      </p>
    </form>
  );
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-1 block text-muted">{label}</span>
      <input
        id={id}
        name={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : 0}
        autoComplete="off"
        onChange={(event) => {
          const next = event.target.valueAsNumber;
          if (Number.isFinite(next)) onChange(next);
        }}
        className="w-full border border-line bg-transparent px-3 py-2 text-base text-fg outline-none focus:border-neon"
      />
    </label>
  );
}

function ChoiceGroup({
  legend,
  name,
  children,
}: {
  legend: string;
  name: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="mt-4">
      <legend className="mb-2 text-sm text-muted">
        {legend}
        <span className="sr-only"> {name}</span>
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Choice({
  name,
  label,
  checked,
  onSelect,
}: {
  name: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`cursor-pointer border px-3 py-2 text-sm focus-within:border-neon ${
        checked ? "border-neon text-neon" : "border-line text-fg"
      }`}
    >
      <input
        className="sr-only"
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
      />
      {label}
    </label>
  );
}
