import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const code = await prisma.qRCode.findUnique({ where: { id } });
  if (!code) {
    return NextResponse.json({ error: "QR code not found" }, { status: 404 });
  }
  return NextResponse.json(code);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await req.json();
  const { name, destinationUrl, styleSettings } = body ?? {};

  if (destinationUrl !== undefined) {
    try {
      new URL(destinationUrl);
    } catch {
      return NextResponse.json({ error: "A valid destination URL is required" }, { status: 400 });
    }
  }

  try {
    const updated = await prisma.qRCode.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(destinationUrl !== undefined && { destinationUrl }),
        ...(styleSettings !== undefined && { styleSettings }),
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "QR code not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    await prisma.qRCode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "QR code not found" }, { status: 404 });
  }
}
