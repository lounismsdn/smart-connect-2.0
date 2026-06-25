import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { generateShortId } from "@/lib/utils";

export async function GET() {
  const codes = await prisma.qRCode.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, shortId: true, updatedAt: true },
  });
  return NextResponse.json(codes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, destinationUrl, styleSettings, shortId } = body ?? {};

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  try {
    new URL(destinationUrl);
  } catch {
    return NextResponse.json({ error: "A valid destination URL is required" }, { status: 400 });
  }

  let attemptShortId = shortId && typeof shortId === "string" ? shortId : generateShortId();

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const created = await prisma.qRCode.create({
        data: {
          name,
          destinationUrl,
          styleSettings: styleSettings ?? {},
          shortId: attemptShortId,
        },
      });
      return NextResponse.json(created, { status: 201 });
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        attemptShortId = generateShortId();
        continue;
      }
      throw err;
    }
  }

  return NextResponse.json({ error: "Could not allocate a unique short id" }, { status: 500 });
}
