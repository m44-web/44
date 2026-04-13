import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audioRecordings, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession, generateId } from "@/lib/auth";
import { writeFileSync } from "fs";
import { join } from "path";
import { emitEvent } from "@/lib/event-bus";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("audio") as File | null;
    const shiftId = formData.get("shiftId") as string | null;
    const durationSec = formData.get("durationSec") as string | null;

    if (!file || !shiftId) {
      return NextResponse.json(
        { error: "音声ファイルとシフトIDが必要です" },
        { status: 400 }
      );
    }

    const id = generateId();
    const ext = file.type.includes("mp4") ? "mp4" : "webm";
    const fileName = `${id}.${ext}`;
    const filePath = join(process.cwd(), "data", "audio", fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(filePath, buffer);

    db.insert(audioRecordings)
      .values({
        id,
        shiftId,
        userId: session.userId,
        filePath: fileName,
        durationSec: durationSec ? parseInt(durationSec, 10) : null,
        recordedAt: new Date(),
      })
      .run();

    emitEvent({
      type: "audio_upload",
      userId: session.userId,
      userName: session.userName,
      recordingId: id,
    });

    return NextResponse.json({ id, fileName });
  } catch {
    return NextResponse.json(
      { error: "音声アップロードに失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const userId = request.nextUrl.searchParams.get("userId");

  const query = db
    .select({
      id: audioRecordings.id,
      shiftId: audioRecordings.shiftId,
      userId: audioRecordings.userId,
      userName: users.name,
      filePath: audioRecordings.filePath,
      durationSec: audioRecordings.durationSec,
      recordedAt: audioRecordings.recordedAt,
    })
    .from(audioRecordings)
    .innerJoin(users, eq(audioRecordings.userId, users.id))
    .orderBy(desc(audioRecordings.recordedAt));

  const results = userId
    ? query.where(eq(audioRecordings.userId, userId)).all()
    : query.all();

  return NextResponse.json({
    recordings: results.map((r) => ({
      ...r,
      recordedAt: r.recordedAt.getTime(),
    })),
  });
}
