import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, generateId } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST() {
  const existing = db
    .select()
    .from(users)
    .where(eq(users.email, "admin@example.com"))
    .get();

  if (existing) {
    return NextResponse.json({ message: "管理者は既に存在します", userId: existing.id });
  }

  const id = generateId();
  db.insert(users)
    .values({
      id,
      name: "管理者",
      email: "admin@example.com",
      passwordHash: hashPassword("admin123"),
      role: "admin",
      createdAt: new Date(),
    })
    .run();

  return NextResponse.json({
    message: "管理者を作成しました",
    userId: id,
    credentials: { email: "admin@example.com", password: "admin123" },
  });
}
