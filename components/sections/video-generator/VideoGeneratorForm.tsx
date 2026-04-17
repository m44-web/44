"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  videoGenerationSchema,
  type VideoGenerationFormData,
} from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  aspectRatioOptions,
  durationOptions,
  promptTemplates,
  categoryLabels,
  type VideoCategory,
} from "@/lib/data/video-generator";
import { VideoGenerationStatus } from "./VideoGenerationStatus";
import { VideoResult } from "./VideoResult";

type GeneratedVideo = {
  id: string;
  videoUrl: string;
  prompt: string;
  label: string;
};

type GenerationState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "generating"; requestId: string; endpoint: string; label: string }
  | { phase: "completed" }
  | { phase: "error"; message: string };

export function VideoGeneratorForm() {
  const [generationState, setGenerationState] = useState<GenerationState>({
    phase: "idle",
  });
  const [selectedCategory, setSelectedCategory] =
    useState<VideoCategory>("cm");
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VideoGenerationFormData>({
    resolver: zodResolver(videoGenerationSchema),
    defaultValues: {
      aspectRatio: "16:9",
      duration: "8",
      model: "seedance-2.0-fast",
    },
  });

  const currentPrompt = watch("prompt");
  const currentAspectRatio = watch("aspectRatio");
  const currentDuration = watch("duration");
  const currentModel = watch("model");

  const filteredTemplates = promptTemplates.filter(
    (t) => t.category === selectedCategory
  );

  const onSubmit = async (data: VideoGenerationFormData) => {
    setGenerationState({ phase: "submitting" });
    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          imageUrl: data.imageUrl || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const activeTemplate = promptTemplates.find(
          (t) => t.prompt === data.prompt
        );
        setGenerationState({
          phase: "generating",
          requestId: json.requestId,
          endpoint: json.endpoint,
          label: activeTemplate?.label || "カスタム動画",
        });
      } else {
        setGenerationState({
          phase: "error",
          message: json.error || "リクエストに失敗しました",
        });
      }
    } catch {
      setGenerationState({
        phase: "error",
        message: "リクエストの送信に失敗しました",
      });
    }
  };

  const handleComplete = useCallback(
    (videoUrl: string) => {
      if (generationState.phase !== "generating") return;
      setGeneratedVideos((prev) => [
        {
          id: `video-${Date.now()}`,
          videoUrl,
          prompt:
            currentPrompt ||
            (generationState.phase === "generating"
              ? generationState.label
              : ""),
          label:
            generationState.phase === "generating"
              ? generationState.label
              : "動画",
        },
        ...prev,
      ]);
      setGenerationState({ phase: "completed" });
    },
    [generationState, currentPrompt]
  );

  const handleError = useCallback((message: string) => {
    setGenerationState({ phase: "error", message });
  }, []);

  const handleReset = () => {
    setGenerationState({ phase: "idle" });
  };

  const inputClasses =
    "w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
  const labelClasses = "block text-sm font-medium text-text-primary mb-2";
  const errorClasses = "text-red-400 text-sm mt-1";

  if (
    generationState.phase === "generating" &&
    generationState.requestId
  ) {
    return (
      <VideoGenerationStatus
        requestId={generationState.requestId}
        endpoint={generationState.endpoint}
        onComplete={handleComplete}
        onError={handleError}
      />
    );
  }

  if (generationState.phase === "completed" && generatedVideos.length > 0) {
    return (
      <div className="space-y-8">
        <VideoResult
          videoUrl={generatedVideos[0].videoUrl}
          onReset={handleReset}
        />

        {generatedVideos.length > 1 && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              生成済み動画一覧
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {generatedVideos.slice(1).map((video) => (
                <Card key={video.id} className="p-4">
                  <video
                    src={video.videoUrl}
                    className="w-full rounded mb-2"
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
                  <p className="text-sm text-text-secondary truncate">
                    {video.label}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-3xl mx-auto space-y-6 rounded-2xl border border-border bg-card-bg p-8 sm:p-10"
      >
        {/* Category Tabs */}
        <div>
          <label className={labelClasses}>カテゴリ</label>
          <div className="flex gap-2">
            {(Object.entries(categoryLabels) as [VideoCategory, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    selectedCategory === key
                      ? "bg-accent text-primary"
                      : "bg-sub-bg text-text-secondary hover:text-text-primary border border-border"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <label className={labelClasses}>テンプレート</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setValue("prompt", template.prompt)}
                className={`text-left px-4 py-3 rounded-lg text-sm transition-all cursor-pointer border ${
                  currentPrompt === template.prompt
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border bg-sub-bg text-text-secondary hover:border-accent/30 hover:text-text-primary"
                }`}
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div>
          <label htmlFor="prompt" className={labelClasses}>
            プロンプト <span className="text-red-400">*</span>
          </label>
          <textarea
            id="prompt"
            rows={4}
            placeholder="映画のような映像を生成するためのプロンプトを入力してください"
            className={`${inputClasses} resize-vertical`}
            {...register("prompt")}
          />
          {errors.prompt && (
            <p className={errorClasses}>{errors.prompt.message}</p>
          )}
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className={labelClasses}>アスペクト比</label>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {aspectRatioOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValue(
                    "aspectRatio",
                    option.value as VideoGenerationFormData["aspectRatio"]
                  )
                }
                className={`px-3 py-2 rounded-lg text-xs transition-all cursor-pointer border text-center ${
                  currentAspectRatio === option.value
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border bg-sub-bg text-text-secondary hover:border-accent/30"
                }`}
              >
                <span className="block font-medium">{option.label}</span>
                <span className="block mt-0.5 text-[10px] opacity-70">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration & Model */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClasses}>再生時間</label>
            <div className="flex gap-2">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setValue(
                      "duration",
                      option.value as VideoGenerationFormData["duration"]
                    )
                  }
                  className={`flex-1 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer border text-center ${
                    currentDuration === option.value
                      ? "border-accent bg-accent/10 text-text-primary"
                      : "border-border bg-sub-bg text-text-secondary hover:border-accent/30"
                  }`}
                >
                  <span className="block font-medium">{option.label}</span>
                  <span className="block mt-0.5 text-[10px] opacity-70">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClasses}>生成モード</label>
            <div className="flex gap-2">
              {(
                [
                  {
                    value: "seedance-2.0-fast",
                    label: "高速",
                    desc: "低コスト",
                  },
                  {
                    value: "seedance-2.0",
                    label: "高品質",
                    desc: "最高画質",
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue("model", option.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer border text-center ${
                    currentModel === option.value
                      ? "border-accent bg-accent/10 text-text-primary"
                      : "border-border bg-sub-bg text-text-secondary hover:border-accent/30"
                  }`}
                >
                  <span className="block font-medium">{option.label}</span>
                  <span className="block mt-0.5 text-[10px] opacity-70">
                    {option.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Image URL */}
        <div>
          <label htmlFor="imageUrl" className={labelClasses}>
            参照画像URL（任意）
          </label>
          <input
            id="imageUrl"
            type="url"
            placeholder="https://example.com/reference.jpg"
            className={inputClasses}
            {...register("imageUrl")}
          />
          {errors.imageUrl && (
            <p className={errorClasses}>{errors.imageUrl.message}</p>
          )}
          <p className="text-xs text-text-secondary/50 mt-1">
            画像を元に動画を生成したい場合にURLを入力してください
          </p>
        </div>

        {/* Error Display */}
        {generationState.phase === "error" && (
          <p className="text-red-400 text-sm text-center">
            {generationState.message}
          </p>
        )}

        {/* Submit */}
        <div className="text-center pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={generationState.phase === "submitting"}
          >
            {generationState.phase === "submitting"
              ? "送信中..."
              : "映画風動画を生成する"}
          </Button>
        </div>
      </form>

      {/* Previously Generated Videos */}
      {generatedVideos.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            生成済み動画（{generatedVideos.length}件）
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {generatedVideos.map((video) => (
              <Card key={video.id} className="p-4">
                <video
                  src={video.videoUrl}
                  className="w-full rounded mb-2"
                  controls
                  muted
                  playsInline
                />
                <p className="text-sm text-text-secondary truncate">
                  {video.label}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
