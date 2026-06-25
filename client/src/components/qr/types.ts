import type { CornerDotType, CornerSquareType, DotType } from "qr-code-styling";

export interface QRGradient {
  enabled: boolean;
  type: "linear" | "radial";
  rotation: number;
  from: string;
  to: string;
}

export interface QRStyleSettings {
  preset: string;
  fgColor: string;
  bgColor: string;
  gradient: QRGradient;
  dotsType: DotType;
  cornersSquareType: CornerSquareType;
  cornersDotType: CornerDotType;
  logoDataUrl?: string;
  frameText?: string;
  margin: number;
}

export const DEFAULT_STYLE_SETTINGS: QRStyleSettings = {
  preset: "Classic",
  fgColor: "#0a0a0f",
  bgColor: "#ffffff",
  gradient: {
    enabled: false,
    type: "linear",
    rotation: 45,
    from: "#2563eb",
    to: "#06b6d4",
  },
  dotsType: "square",
  cornersSquareType: "square",
  cornersDotType: "square",
  margin: 16,
};

export interface QRRecordSummary {
  id: string;
  name: string;
  shortId: string;
  updatedAt: string;
}

export interface QRRecord extends QRRecordSummary {
  destinationUrl: string;
  styleSettings: QRStyleSettings;
  createdAt: string;
}
