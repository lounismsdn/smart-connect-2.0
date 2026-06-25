"use client";

import { useState } from "react";
import { toast } from "sonner";
import { exportQrCode } from "./qr-export";
import { QRStyleSettings } from "./types";
import { slugify } from "@/lib/utils";

interface ExportActionsProps {
  settings: QRStyleSettings;
  data: string;
  name: string;
}

export default function ExportActions({ settings, data, name }: ExportActionsProps) {
  const [exporting, setExporting] = useState<"png" | "svg" | null>(null);

  async function handleExport(extension: "png" | "svg") {
    setExporting(extension);
    try {
      await exportQrCode(settings, data, extension, slugify(name || "qr-code"));
    } catch {
      toast.error(`Failed to export ${extension.toUpperCase()}`);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => handleExport("png")}
        disabled={exporting !== null}
        className="flex-1 rounded-md border border-(--border) bg-(--bg-surface) px-4 py-2.5 text-sm font-medium transition-colors hover:border-(--border-active) disabled:opacity-50"
      >
        {exporting === "png" ? "Exporting…" : "Export PNG"}
      </button>
      <button
        type="button"
        onClick={() => handleExport("svg")}
        disabled={exporting !== null}
        className="flex-1 rounded-md border border-(--border) bg-(--bg-surface) px-4 py-2.5 text-sm font-medium transition-colors hover:border-(--border-active) disabled:opacity-50"
      >
        {exporting === "svg" ? "Exporting…" : "Export SVG"}
      </button>
    </div>
  );
}
