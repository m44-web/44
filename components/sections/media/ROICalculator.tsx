"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

const AI_PLAN_PRICE = 29800;

export function ROICalculator() {
  const [hours, setHours] = useState(20);
  const [hourlyRate, setHourlyRate] = useState(1200);

  const humanMonthlyWage = hours * 4 * hourlyRate;
  const humanWithOverhead = Math.round(humanMonthlyWage * 1.25);
  const monthlySaving = humanWithOverhead - AI_PLAN_PRICE;
  const yearlySaving = monthlySaving * 12;
  const roiPercent = Math.round((monthlySaving / AI_PLAN_PRICE) * 100);

  const inputStyle =
    "w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

  return (
    <section className="py-24">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="コスト比較シミュレーター"
            subtitle="人間のパート社員を雇う場合と、AI社員（正社員プラン）の比較"
          />
        </MotionWrapper>

        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto mt-12">
          <MotionWrapper delay={0.1}>
            <Card>
              <h3 className="text-lg font-bold text-text-primary mb-6">
                あなたの会社の状況を入力
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    総務業務に使っている時間（週あたり）
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="flex-1 accent-accent"
                    />
                    <span className="text-accent font-bold text-xl font-display w-24 text-right">
                      {hours}時間
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    議事録作成・FAQ対応・日報集計・備品管理などの合計
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    想定時給（パート相当）
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="900"
                      max="3000"
                      step="100"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className={inputStyle}
                    />
                    <span className="text-text-secondary text-sm shrink-0">円/時</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    パート社員の時給相場（東京：1,200〜1,500円）
                  </p>
                </div>
              </div>
            </Card>
          </MotionWrapper>

          <MotionWrapper delay={0.2}>
            <Card className="border-accent/30">
              <h3 className="text-lg font-bold text-text-primary mb-6">
                月次コスト比較
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-sub-bg border border-border">
                  <p className="text-xs text-text-secondary mb-1">人間のパート社員</p>
                  <p className="text-text-primary text-sm mb-2">
                    基本給 + 社保・交通費等（+25%）
                  </p>
                  <p className="text-2xl font-bold text-text-primary font-display">
                    ¥{humanWithOverhead.toLocaleString()}
                    <span className="text-sm text-text-secondary ml-1">/月</span>
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-accent/5 border border-accent/30">
                  <p className="text-xs text-accent mb-1">AI社員（正社員プラン）</p>
                  <p className="text-text-primary text-sm mb-2">タスク無制限・24時間稼働</p>
                  <p className="text-2xl font-bold text-accent font-display">
                    ¥{AI_PLAN_PRICE.toLocaleString()}
                    <span className="text-sm text-text-secondary ml-1">/月</span>
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-transparent border border-accent/40">
                  <p className="text-xs text-accent mb-1 font-semibold">削減できる金額</p>
                  <div className="flex items-baseline gap-4">
                    <p className="text-3xl sm:text-4xl font-bold text-accent font-display">
                      ¥{Math.max(monthlySaving, 0).toLocaleString()}
                      <span className="text-sm text-text-secondary ml-1">/月</span>
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    年換算：¥{Math.max(yearlySaving, 0).toLocaleString()} /
                    ROI：{Math.max(roiPercent, 0)}%
                  </p>
                </div>
              </div>
            </Card>
          </MotionWrapper>
        </div>

        <p className="text-center text-xs text-text-secondary mt-8 max-w-2xl mx-auto">
          ※ 人間の社員コストは「基本給 + 社保・交通費・採用広告費等 = 実質1.25倍」で試算。
          実際の効果はお客様の業務内容によって異なります。
        </p>
      </Container>
    </section>
  );
}
