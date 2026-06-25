"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import QRPreview from "./QRPreview";
import CustomizationPanel from "./CustomizationPanel";
import ExportActions from "./ExportActions";
import { DEFAULT_STYLE_SETTINGS, QRRecord, QRStyleSettings } from "./types";
import { generateShortId } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";

interface QRStudioProps {
  initial?: QRRecord;
}

export default function QRStudio({ initial }: QRStudioProps) {
  const router = useRouter();
  const [id, setId] = useState<string | undefined>(initial?.id);
  const [shortId] = useState(() => initial?.shortId ?? generateShortId());
  const [name, setName] = useState(initial?.name ?? "Untitled QR Code");
  const [destinationUrl, setDestinationUrl] = useState(initial?.destinationUrl ?? "https://");
  const [settings, setSettings] = useState<QRStyleSettings>(
    initial?.styleSettings ?? DEFAULT_STYLE_SETTINGS
  );
  const [origin] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : SITE_URL
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const redirectUrl = `${origin}/r/${shortId}`;

  async function handleSave() {
    setSaving(true);
    try {
      if (id) {
        const res = await fetch(`/api/qr/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, destinationUrl, styleSettings: settings }),
        });
        if (!res.ok) throw new Error();
        toast.success("QR code updated");
        router.refresh();
      } else {
        const res = await fetch("/api/qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, destinationUrl, styleSettings: settings, shortId }),
        });
        if (!res.ok) throw new Error();
        const created = await res.json();
        setId(created.id);
        toast.success("QR code created");
        router.push(`/qr/${created.id}`);
      }
    } catch {
      toast.error("Failed to save QR code");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/qr/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("QR code deleted");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to delete QR code");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8 lg:flex-row">
      <div className="flex flex-col gap-6 lg:w-[360px]">
        <div className="glass-panel flex flex-col gap-4 p-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-(--text-muted)">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input"
              placeholder="My QR Code"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-(--text-muted)">
              Destination URL
            </span>
            <input
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              className="glass-input"
              placeholder="https://example.com"
            />
          </label>
          {id && (
            <div className="flex flex-col gap-1.5 rounded-md bg-(--bg-surface) p-3">
              <span className="text-xs text-(--text-muted)">This QR always points to</span>
              <code className="truncate text-sm text-(--accent-cyan-light)">{redirectUrl}</code>
            </div>
          )}
        </div>

        <QRPreview settings={settings} data={redirectUrl} />

        <ExportActions settings={settings} data={redirectUrl} name={name} />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="glow-primary flex-1 rounded-md bg-(--primary) px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--primary-hover) disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </span>
            ) : id ? (
              "Save Changes"
            ) : (
              "Create QR Code"
            )}
          </button>
          {id && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md border border-(--error) px-4 py-2.5 text-(--error) transition-colors hover:bg-(--error-bg) disabled:opacity-50"
              aria-label="Delete QR code"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel flex-1 p-6">
        <CustomizationPanel settings={settings} onChange={setSettings} />
      </div>
    </div>
  );
}
