import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
  newPassword: z.string().min(6, "新しいパスワードは6文字以上必要です"),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const user = db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .get();

    if (!user || !verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
      return NextResponse.json(
        { error: "現在のパスワードが正しくありません" },
        { status: 401 }
      );
    }

    db.update(users)
      .set({ passwordHash: hashPassword(parsed.data.newPassword) })
      .where(eq(users.id, session.userId))
      .run();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "パスワード変更に失敗しました" },
      { status: 500 }
    );
  }
}
