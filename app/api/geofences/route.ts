import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { geofences } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getSession, generateId } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusM: z.number().min(10).max(100000),
  type: z.enum(["allowed", "forbidden"]),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const rows = db
    .select()
    .from(geofences)
    .orderBy(desc(geofences.createdAt))
    .all();

  return NextResponse.json({
    geofences: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.getTime(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const id = generateId();
  db.insert(geofences)
    .values({
      id,
      ...parsed.data,
      createdAt: new Date(),
    })
    .run();

  return NextResponse.json({ id, ...parsed.data });
}
