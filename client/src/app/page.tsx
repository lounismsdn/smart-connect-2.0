import { prisma } from "@/lib/prisma";
import QRSidebarList from "@/components/qr/QRSidebarList";
import QRStudio from "@/components/qr/QRStudio";

export const dynamic = "force-dynamic";

export default async function Home() {
  const records = await prisma.qRCode.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, shortId: true, updatedAt: true },
  });
  const items = records.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() }));

  return (
    <div className="flex flex-1 flex-col bg-(--bg-deep)">
      <header className="border-b border-(--border) px-8 py-6">
        <h1 className="font-(family-name:--font-display) text-2xl font-bold tracking-tight">
          Trend Waves <span className="gradient-text">SmartConnect</span>
        </h1>
        <p className="text-sm text-(--text-secondary)">QR Studio — design dynamic QR codes</p>
      </header>
      <main className="flex flex-1 flex-col gap-8 p-8 lg:flex-row">
        <QRSidebarList items={items} />
        <QRStudio />
      </main>
    </div>
  );
}
