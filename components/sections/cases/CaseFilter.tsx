"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { cases, industries, type CaseStudy } from "@/lib/data/cases";
import { CaseGrid } from "./CaseGrid";

export function CaseFilter() {
  const [activeFilter, setActiveFilter] = useState("すべて");

  const filtered: CaseStudy[] =
    activeFilter === "すべて"
      ? cases
      : cases.filter((c) => c.industry === activeFilter);

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {industries.map((industry) => (
          <Badge
            key={industry}
            label={industry}
            active={activeFilter === industry}
            onClick={() => setActiveFilter(industry)}
          />
        ))}
      </div>
      <CaseGrid cases={filtered} />
    </>
  );
}
