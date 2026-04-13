"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { useRealtime } from "./RealtimeProvider";

interface Employee {
  id: string;
  name: string;
  email: string;
  isOnShift: boolean;
  currentShiftId: string | null;
}

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { lastEvent } = useRealtime();

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

  // Refresh on shift events
  useEffect(() => {
    if (lastEvent?.type === "shift_start" || lastEvent?.type === "shift_end") {
      fetchEmployees();
    }
  }, [lastEvent, fetchEmployees]);

  const onShift = employees.filter((e) => e.isOnShift);
  const offShift = employees.filter((e) => !e.isOnShift);

  return (
    <Card>
      <h2 className="font-semibold mb-4">従業員ステータス</h2>

      {employees.length === 0 && (
        <p className="text-text-muted text-sm">
          従業員が登録されていません。「従業員管理」から登録してください。
        </p>
      )}

      {onShift.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-success mb-2">
            稼働中 ({onShift.length})
          </h3>
          <div className="space-y-2">
            {onShift.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20"
              >
                <span className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
                <div>
                  <p className="font-medium text-sm">{emp.name}</p>
                  <p className="text-xs text-text-muted">{emp.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {offShift.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">
            オフライン ({offShift.length})
          </h3>
          <div className="space-y-2">
            {offShift.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5"
              >
                <span className="w-2.5 h-2.5 bg-text-muted rounded-full" />
                <div>
                  <p className="font-medium text-sm">{emp.name}</p>
                  <p className="text-xs text-text-muted">{emp.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
