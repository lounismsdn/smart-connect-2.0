import Link from "next/link";
import { Plus, QrCode } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { QRRecordSummary } from "./types";

interface QRSidebarListProps {
  items: QRRecordSummary[];
  activeId?: string;
}

export default function QRSidebarList({ items, activeId }: QRSidebarListProps) {
  return (
    <aside className="flex w-full flex-col gap-4 lg:w-64">
      <Link
        href="/"
        className="flex items-center justify-center gap-2 rounded-md border border-dashed border-(--border-hover) px-4 py-2.5 text-sm font-medium text-(--text-secondary) transition-colors hover:border-(--primary) hover:text-(--text-primary)"
      >
        <Plus className="h-4 w-4" /> New QR Code
      </Link>

      <div className="flex flex-col gap-1.5">
        {items.length === 0 && (
          <p className="px-2 py-4 text-sm text-(--text-muted)">No QR codes yet.</p>
        )}
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/qr/${item.id}`}
            className={cn(
              "glass-panel glass-panel-interactive flex items-center gap-3 px-3 py-2.5",
              activeId === item.id && "border-(--primary) bg-(--primary-subtle)"
            )}
          >
            <QrCode className="h-4 w-4 shrink-0 text-(--text-secondary)" />
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{item.name}</span>
              <span className="text-xs text-(--text-muted)">
                {formatRelativeTime(item.updatedAt)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
