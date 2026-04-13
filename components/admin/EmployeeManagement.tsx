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
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen">
      <header className="bg-surface border-b border-white/10">
        <Container className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold">従業員管理</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" className="text-sm">
                ダッシュボード
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
          <h2 className="font-semibold mb-4">登録済み従業員 ({employees.length}名)</h2>
          {employees.length === 0 ? (
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="py-3">{emp.name}</td>
                      <td className="py-3 text-text-muted">{emp.email}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${
                            emp.isOnShift
                              ? "bg-success/20 text-success"
                              : "bg-white/10 text-text-muted"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              emp.isOnShift ? "bg-success" : "bg-text-muted"
                            }`}
                          />
                          {emp.isOnShift ? "稼働中" : "オフライン"}
                        </span>
                      </td>
                      <td className="py-3 text-text-muted">
                        {new Date(emp.createdAt).toLocaleDateString("ja-JP")}
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
