"use client";

import { ChangeEvent } from "react";
import type { CornerDotType, CornerSquareType, DotType } from "qr-code-styling";
import { cn } from "@/lib/utils";
import { QR_PRESETS, applyPreset } from "./presets";
import { QRStyleSettings } from "./types";

interface CustomizationPanelProps {
  settings: QRStyleSettings;
  onChange: (settings: QRStyleSettings) => void;
}

const DOT_TYPES: { value: DotType; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dots", label: "Dots" },
  { value: "rounded", label: "Rounded" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy Rounded" },
  { value: "extra-rounded", label: "Extra Rounded" },
];

const CORNER_SQUARE_TYPES: { value: CornerSquareType; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Circle" },
  { value: "extra-rounded", label: "Extra Rounded" },
  { value: "classy", label: "Classy" },
];

const CORNER_DOT_TYPES: { value: CornerDotType; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Circle" },
  { value: "classy-rounded", label: "Classy Rounded" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-(--text-muted)">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function CustomizationPanel({ settings, onChange }: CustomizationPanelProps) {
  function patch(partial: Partial<QRStyleSettings>) {
    onChange({ ...settings, ...partial });
  }

  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => patch({ logoDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-7">
      <Section title="Presets">
        <div className="grid grid-cols-2 gap-2">
          {QR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(applyPreset(settings, preset))}
              className={cn(
                "glass-panel glass-panel-interactive flex flex-col gap-1 p-3 text-left",
                settings.preset === preset.name && "border-(--primary) bg-(--primary-subtle)"
              )}
            >
              <span className="text-sm font-semibold">{preset.name}</span>
              <span className="text-xs text-(--text-secondary)">{preset.description}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Colors">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs text-(--text-secondary)">
            Foreground
            <input
              type="color"
              value={settings.fgColor}
              onChange={(e) => patch({ fgColor: e.target.value })}
              className="h-10 w-full cursor-pointer rounded-md border border-(--border) bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-(--text-secondary)">
            Background
            <input
              type="color"
              value={settings.bgColor}
              onChange={(e) => patch({ bgColor: e.target.value })}
              className="h-10 w-full cursor-pointer rounded-md border border-(--border) bg-transparent"
            />
          </label>
        </div>

        <label className="flex items-center justify-between gap-2 pt-1 text-sm">
          <span>Gradient</span>
          <input
            type="checkbox"
            checked={settings.gradient.enabled}
            onChange={(e) =>
              patch({ gradient: { ...settings.gradient, enabled: e.target.checked } })
            }
          />
        </label>

        {settings.gradient.enabled && (
          <div className="flex flex-col gap-3 rounded-lg border border-(--border) p-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-xs text-(--text-secondary)">
                From
                <input
                  type="color"
                  value={settings.gradient.from}
                  onChange={(e) =>
                    patch({ gradient: { ...settings.gradient, from: e.target.value } })
                  }
                  className="h-9 w-full cursor-pointer rounded-md border border-(--border) bg-transparent"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs text-(--text-secondary)">
                To
                <input
                  type="color"
                  value={settings.gradient.to}
                  onChange={(e) =>
                    patch({ gradient: { ...settings.gradient, to: e.target.value } })
                  }
                  className="h-9 w-full cursor-pointer rounded-md border border-(--border) bg-transparent"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-xs text-(--text-secondary)">
              Type
              <select
                value={settings.gradient.type}
                onChange={(e) =>
                  patch({
                    gradient: { ...settings.gradient, type: e.target.value as "linear" | "radial" },
                  })
                }
                className="glass-input"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
            </label>
          </div>
        )}
      </Section>

      <Section title="Module Style">
        <select
          value={settings.dotsType}
          onChange={(e) => patch({ dotsType: e.target.value as DotType })}
          className="glass-input"
        >
          {DOT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Corner Style">
        <div className="grid grid-cols-2 gap-3">
          <select
            value={settings.cornersSquareType}
            onChange={(e) => patch({ cornersSquareType: e.target.value as CornerSquareType })}
            className="glass-input"
          >
            {CORNER_SQUARE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={settings.cornersDotType}
            onChange={(e) => patch({ cornersDotType: e.target.value as CornerDotType })}
            className="glass-input"
          >
            {CORNER_DOT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Logo">
        <div className="flex items-center gap-3">
          <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs" />
          {settings.logoDataUrl && (
            <button
              type="button"
              onClick={() => patch({ logoDataUrl: undefined })}
              className="text-xs text-(--error) hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      </Section>

      <Section title="Frame Text">
        <input
          type="text"
          maxLength={24}
          placeholder="e.g. SCAN ME"
          value={settings.frameText ?? ""}
          onChange={(e) => patch({ frameText: e.target.value || undefined })}
          className="glass-input"
        />
      </Section>

      <Section title="Margin">
        <input
          type="range"
          min={0}
          max={40}
          value={settings.margin}
          onChange={(e) => patch({ margin: Number(e.target.value) })}
          className="w-full"
        />
      </Section>
    </div>
  );
}
