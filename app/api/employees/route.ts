import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, shifts } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { getSession, hashPassword, generateId } from "@/lib/auth";
import { createEmployeeSchema } from "@/lib/validations";

export async function GET() {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const employees = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      deactivatedAt: users.deactivatedAt,
    })
    .from(users)
    .where(eq(users.role, "employee"))
    .all();

  // Add shift status for each employee
  const result = employees.map((emp) => {
    const activeShift = db
      .select()
      .from(shifts)
      .where(and(eq(shifts.userId, emp.id), isNull(shifts.endedAt)))
      .get();

    return {
      ...emp,
      createdAt: emp.createdAt.getTime(),
      deactivatedAt: emp.deactivatedAt?.getTime() ?? null,
      isOnShift: !!activeShift,
      currentShiftId: activeShift?.id ?? null,
    };
  });

  return NextResponse.json({ employees: result });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if email already exists
    const existing = db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existing) {
      return NextResponse.json(
        { error: "このメールアドレスは既に使用されています" },
        { status: 409 }
      );
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

    return NextResponse.json({ id, name, email });
  } catch {
    return NextResponse.json(
      { error: "従業員の登録に失敗しました" },
      { status: 500 }
    );
  }
}
