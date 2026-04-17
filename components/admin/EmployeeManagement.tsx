"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEmployeeSchema, CreateEmployeeInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "./AdminNav";
import Link from "next/link";

interface Employee {
  id: string;
  name: string;
  email: string;
  isOnShift: boolean;
  createdAt: number;
  deactivatedAt: number | null;
}

interface ImportResult {
  row: number;
  name: string;
  email: string;
  status: "created" | "skipped";
  reason?: string;
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null);
  const [importCsvText, setImportCsvText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImportCsvText(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setImporting(true);
    setImportResults(null);
    try {
      const lines = importCsvText
        .trim()
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length === 0) return;

      let startIdx = 0;
      const first = lines[0].toLowerCase();
      if (first.includes("name") || first.includes("名前") || first.includes("email")) {
        startIdx = 1;
      }

      const emps = lines.slice(startIdx).map((line) => {
        const parts = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
        return { name: parts[0] || "", email: parts[1] || "", password: parts[2] || "" };
      });

      const res = await fetch("/api/employees/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employees: emps }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "インポートに失敗しました");
        return;
      }
      setImportResults(data.results);
      if (data.created > 0) fetchEmployees();
    } catch {
      setServerError("インポートに失敗しました");
    } finally {
      setImporting(false);
    }
  };

  const query = searchQuery.trim().toLowerCase();
  const visible = employees
    .filter((e) => (showDeactivated ? true : !e.deactivatedAt))
    .filter((e) =>
      query === ""
        ? true
        : e.name.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query)
    );

  return (
    <div className="min-h-screen">
      <AdminNav />

      <Container className="py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">従業員管理</h1>
          <div className="flex items-center gap-2">
            <a
              href="/api/export?type=shifts&days=30"
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted"
            >
              シフトCSV
            </a>
            <a
              href="/api/export?type=gps&days=7"
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted"
            >
              GPS CSV
            </a>
          </div>
        </div>
        {/* Registration Form */}
        <Card>
          <h2 className="font-semibold mb-4">新規従業員登録</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="emp-name" className="block text-sm text-text-muted mb-1">名前</label>
                <input
                  id="emp-name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "emp-name-err" : undefined}
                  {...register("name")}
                  className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="山田太郎"
                />
                {errors.name && (
                  <p id="emp-name-err" className="mt-1 text-xs text-danger" role="alert">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="emp-email" className="block text-sm text-text-muted mb-1">メール</label>
                <input
                  id="emp-email"
                  type="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "emp-email-err" : undefined}
                  {...register("email")}
                  className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="yamada@example.com"
                />
                {errors.email && (
                  <p id="emp-email-err" className="mt-1 text-xs text-danger" role="alert">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="emp-pw" className="block text-sm text-text-muted mb-1">パスワード</label>
                <input
                  id="emp-pw"
                  type="password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "emp-pw-err" : undefined}
                  {...register("password")}
                  className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="6文字以上"
                />
                {errors.password && (
                  <p id="emp-pw-err" className="mt-1 text-xs text-danger" role="alert">{errors.password.message}</p>
                )}
              </div>
            </div>

            {serverError && (
              <div role="alert" className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
                {serverError}
              </div>
            )}

            {successMsg && (
              <div role="status" className="p-3 bg-success/10 border border-success/30 rounded-lg text-success text-sm">
                {successMsg}
              </div>
            )}

            <Button type="submit" loading={isSubmitting}>
              登録
            </Button>
          </form>
        </Card>

        {/* Bulk Import */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">一括インポート</h2>
            <button
              onClick={() => setShowImport((v) => !v)}
              className="text-xs text-primary hover:underline"
            >
              {showImport ? "閉じる" : "CSVでインポート"}
            </button>
          </div>
          {showImport && (
            <div className="space-y-3">
              <p className="text-xs text-text-muted">
                CSV形式: 名前,メール,パスワード（1行1名、ヘッダー行あり可）
              </p>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="text-xs file:mr-2 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:text-xs file:cursor-pointer"
                />
              </div>
              <textarea
                value={importCsvText}
                onChange={(e) => setImportCsvText(e.target.value)}
                rows={4}
                placeholder={"名前,メール,パスワード\n山田太郎,yamada@example.com,password123\n鈴木花子,suzuki@example.com,password456"}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm text-text font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleImport}
                  loading={importing}
                  disabled={!importCsvText.trim()}
                >
                  インポート実行
                </Button>
              </div>
              {importResults && (
                <div className="space-y-1 text-xs">
                  <p className="font-medium">
                    結果: {importResults.filter((r) => r.status === "created").length}件作成,{" "}
                    {importResults.filter((r) => r.status === "skipped").length}件スキップ
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-0.5">
                    {importResults.map((r) => (
                      <div
                        key={r.row}
                        className={`px-2 py-1 rounded ${
                          r.status === "created"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {r.row}行目: {r.name} ({r.email}) -{" "}
                        {r.status === "created" ? "作成" : `スキップ: ${r.reason}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Employee List */}
        <Card>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-semibold">
              登録済み従業員 ({visible.length}名)
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <label htmlFor="emp-search" className="sr-only">従業員検索</label>
              <input
                id="emp-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="名前 / メールで検索"
                className="px-3 py-1.5 bg-surface-light border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
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
