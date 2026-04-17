import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, hashPassword, generateId } from "@/lib/auth";
import { z } from "zod";

const rowSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const rows: unknown[] = body.employees;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "従業員データが必要です" },
        { status: 400 }
      );
    }

    if (rows.length > 100) {
      return NextResponse.json(
        { error: "一度にインポートできるのは100件までです" },
        { status: 400 }
      );
    }

    const results: Array<{
      row: number;
      name: string;
      email: string;
      status: "created" | "skipped";
      reason?: string;
    }> = [];

    for (let i = 0; i < rows.length; i++) {
      const parsed = rowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        results.push({
          row: i + 1,
          name: String((rows[i] as Record<string, unknown>)?.name ?? ""),
          email: String((rows[i] as Record<string, unknown>)?.email ?? ""),
          status: "skipped",
          reason: parsed.error.issues[0].message,
        });
        continue;
      }

      const { name, email, password } = parsed.data;

      const existing = db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .get();

      if (existing) {
        results.push({ row: i + 1, name, email, status: "skipped", reason: "メールアドレスが既に登録済み" });
        continue;
      }

      const id = generateId();
      db.insert(users)
        .values({
          id,
          name,
          email,
          passwordHash: hashPassword(password),
          role: "employee",
          createdAt: new Date(),
        })
        .run();

      results.push({ row: i + 1, name, email, status: "created" });
    }

    const created = results.filter((r) => r.status === "created").length;
    const skipped = results.filter((r) => r.status === "skipped").length;

    return NextResponse.json({ created, skipped, results });
  } catch {
    return NextResponse.json(
      { error: "インポートに失敗しました" },
      { status: 500 }
    );
  }
}
