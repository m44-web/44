import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);
  const limit = checkRateLimit("login", identifier, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `ログイン試行回数が上限に達しました。${Math.ceil(limit.resetInMs / 1000)}秒後に再試行してください`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    if (user.deactivatedAt) {
      return NextResponse.json(
        { error: "このアカウントは無効化されています" },
        { status: 403 }
      );
    }

    await createSession(user.id);

    audit({
      actorId: user.id,
      actorName: user.name,
      action: "login",
      detail: `from ${identifier}`,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "ログインに失敗しました" },
      { status: 500 }
    );
  }
}
