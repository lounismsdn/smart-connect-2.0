import { DEFAULT_STYLE_SETTINGS, QRStyleSettings } from "./types";

export interface QRPreset {
  name: string;
  description: string;
  settings: Omit<QRStyleSettings, "preset" | "logoDataUrl" | "frameText" | "margin">;
}

export const QR_PRESETS: QRPreset[] = [
  {
    name: "Classic",
    description: "Crisp square modules, timeless contrast",
    settings: {
      fgColor: "#0a0a0f",
      bgColor: "#ffffff",
      gradient: { ...DEFAULT_STYLE_SETTINGS.gradient, enabled: false },
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
    },
  },
  {
    name: "Rounded Flow",
    description: "Soft rounded modules with a cobalt gradient",
    settings: {
      fgColor: "#2563eb",
      bgColor: "#ffffff",
      gradient: { enabled: true, type: "linear", rotation: 45, from: "#2563eb", to: "#06b6d4" },
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
    },
  },
  {
    name: "Minimal",
    description: "Understated dots on a clean white field",
    settings: {
      fgColor: "#18181b",
      bgColor: "#fafafa",
      gradient: { ...DEFAULT_STYLE_SETTINGS.gradient, enabled: false },
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
    },
  },
  {
    name: "Premium",
    description: "Classy modules with a deep violet sheen",
    settings: {
      fgColor: "#7c3aed",
      bgColor: "#0a0a0f",
      gradient: { enabled: true, type: "linear", rotation: 135, from: "#7c3aed", to: "#2563eb" },
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
    },
  },
  {
    name: "Liquid Wave",
    description: "Extra-rounded liquid modules in cyan",
    settings: {
      fgColor: "#06b6d4",
      bgColor: "#ffffff",
      gradient: { enabled: true, type: "radial", rotation: 0, from: "#06b6d4", to: "#22d3ee" },
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
    },
  },
];

export function applyPreset(current: QRStyleSettings, preset: QRPreset): QRStyleSettings {
  return {
    ...current,
    ...preset.settings,
    preset: preset.name,
  };
}
