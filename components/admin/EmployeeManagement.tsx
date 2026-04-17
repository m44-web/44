"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmployeeSchema, CreateEmployeeInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import Link from "next/link";

interface Employee {
  id: string;
  name: string;
  email: string;
  isOnShift: boolean;
  createdAt: number;
  deactivatedAt: number | null;
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
  });

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/employees");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const onSubmit = async (data: CreateEmployeeInput) => {
    setServerError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "登録に失敗しました");
        return;
      }
      setSuccessMsg(`${json.name}（${json.email}）を登録しました`);
      reset();
      fetchEmployees();
    } catch {
      setServerError("通信エラーが発生しました");
    }
  };

  const handleDeactivate = async (emp: Employee) => {
    if (!confirm(`${emp.name} を無効化しますか？\n稼働中のシフトも終了されます。`)) return;
    try {
      const res = await fetch(`/api/employees/${emp.id}`, { method: "DELETE" });
      if (res.ok) fetchEmployees();
    } catch {
      // ignore
    }
  };

  const handleReactivate = async (emp: Employee) => {
    try {
      const res = await fetch(`/api/employees/${emp.id}`, { method: "PATCH" });
      if (res.ok) fetchEmployees();
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const visible = employees.filter((e) =>
    showDeactivated ? true : !e.deactivatedAt
  );

  return (
    <div className="min-h-screen">
      <header className="bg-surface border-b border-white/10">
        <Container className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-text-muted hover:text-text text-sm">
              ← ダッシュボード
            </Link>
            <h1 className="font-semibold">従業員管理</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/export?type=shifts&days=30"
              className="text-sm px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted"
            >
              シフトCSV
            </a>
            <a
              href="/api/export?type=gps&days=7"
              className="text-sm px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted"
            >
              GPS CSV
            </a>
            <Link href="/settings">
              <Button variant="ghost" className="text-sm">
                設定
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-sm">
              ログアウト
            </Button>
          </div>
        </Container>
      </header>

      <Container className="py-6 space-y-6">
        {/* Registration Form */}
        <Card>
          <h2 className="font-semibold mb-4">新規従業員登録</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">名前</label>
                <input
                  {...register("name")}
                  className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="山田太郎"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">メール</label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="yamada@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">パスワード</label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="6文字以上"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
                )}
              </div>
            </div>

            {serverError && (
              <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
                {serverError}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-success text-sm">
                {successMsg}
              </div>
            )}

            <Button type="submit" loading={isSubmitting}>
              登録
            </Button>
          </form>
        </Card>

        {/* Employee List */}
        <Card>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-semibold">
              登録済み従業員 ({visible.length}名)
            </h2>
            <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showDeactivated}
                onChange={(e) => setShowDeactivated(e.target.checked)}
                className="accent-primary"
              />
              無効化済みを表示
            </label>
          </div>
          {visible.length === 0 ? (
            <p className="text-text-muted text-sm">従業員はまだ登録されていません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-white/10">
                    <th className="pb-2 font-medium">名前</th>
                    <th className="pb-2 font-medium">メール</th>
                    <th className="pb-2 font-medium">ステータス</th>
                    <th className="pb-2 font-medium">登録日</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visible.map((emp) => (
                    <tr key={emp.id} className={emp.deactivatedAt ? "opacity-50" : ""}>
                      <td className="py-3">
                        <Link
                          href={`/admin/employees/${emp.id}`}
                          className="hover:text-primary"
                        >
                          {emp.name}
                        </Link>
                      </td>
                      <td className="py-3 text-text-muted">{emp.email}</td>
                      <td className="py-3">
                        {emp.deactivatedAt ? (
                          <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-danger/20 text-danger">
                            無効化済み
                          </span>
                        ) : emp.isOnShift ? (
                          <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                            稼働中
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-white/10 text-text-muted">
                            <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                            オフライン
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-text-muted">
                        {new Date(emp.createdAt).toLocaleDateString("ja-JP")}
                      </td>
                      <td className="py-3 text-right">
                        {emp.deactivatedAt ? (
                          <button
                            onClick={() => handleReactivate(emp)}
                            className="text-xs px-2 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary"
                          >
                            再有効化
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeactivate(emp)}
                            className="text-xs px-2 py-1 rounded bg-danger/20 hover:bg-danger/30 text-danger"
                          >
                            無効化
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </Container>
    </div>
  );
}
