import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { videoGenerationSchema } from "@/lib/validations";

fal.config({ credentials: process.env.FAL_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = videoGenerationSchema.parse(body);

    const endpoint =
      data.model === "seedance-2.0-fast"
        ? "fal-ai/seedance-2.0/turbo"
        : "fal-ai/seedance-2.0";

    const result = await fal.queue.submit(endpoint, {
      input: {
        prompt: data.prompt,
        aspect_ratio: data.aspectRatio,
        duration: parseInt(data.duration),
        ...(data.imageUrl ? { image_url: data.imageUrl } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      requestId: result.request_id,
      endpoint,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "入力内容に不備があります" },
        { status: 400 }
      );
    }
    console.error("Video generation submission failed:", error);
    return NextResponse.json(
      { success: false, error: "動画生成のリクエストに失敗しました" },
      { status: 500 }
    );
  }
}
