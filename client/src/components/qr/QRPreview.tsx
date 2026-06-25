"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { buildQrOptions } from "./qr-render";
import { QRStyleSettings } from "./types";

interface QRPreviewProps {
  settings: QRStyleSettings;
  data: string;
  size?: number;
}

export default function QRPreview({ settings, data, size = 280 }: QRPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    qrRef.current = new QRCodeStyling(buildQrOptions(settings, data, size));
    qrRef.current.append(containerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    qrRef.current?.update(buildQrOptions(settings, data, size));
  }, [settings, data, size]);

  return (
    <div
      className="flex flex-col items-center gap-4 rounded-2xl p-8 transition-all"
      style={{
        background: settings.bgColor,
        border: settings.frameText ? `3px solid ${settings.fgColor}` : "1px solid var(--border)",
      }}
    >
      <div ref={containerRef} style={{ width: size, height: size }} />
      {settings.frameText && (
        <p
          className="text-sm font-bold uppercase tracking-[0.2em]"
          style={{ color: settings.fgColor }}
        >
          {settings.frameText}
        </p>
      )}
    </div>
  );
}
