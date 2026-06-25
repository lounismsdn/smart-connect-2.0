import { NextRequest, NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ shortId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { shortId } = await params;
  const code = await prisma.qRCode.findUnique({ where: { shortId } });

  if (!code) {
    notFound();
  }

  return NextResponse.redirect(code.destinationUrl, {
    status: 307,
    headers: { "Cache-Control": "no-store" },
  });
}
