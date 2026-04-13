import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audioRecordings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;

  const recording = db
    .select()
    .from(audioRecordings)
    .where(eq(audioRecordings.id, id))
    .get();

  if (!recording) {
    return NextResponse.json({ error: "録音が見つかりません" }, { status: 404 });
  }

  const filePath = join(process.cwd(), "data", "audio", recording.filePath);

  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: "音声ファイルが見つかりません" },
      { status: 404 }
    );
  }

  const buffer = readFileSync(filePath);
  const contentType = recording.filePath.endsWith(".mp4")
    ? "audio/mp4"
    : "audio/webm";

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": buffer.length.toString(),
    },
  });
}
