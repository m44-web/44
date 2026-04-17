import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");
    const endpoint = searchParams.get("endpoint") || "fal-ai/seedance-2.0";

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "リクエストIDが必要です" },
        { status: 400 }
      );
    }

    const status = await fal.queue.status(endpoint, {
      requestId,
      logs: false,
    });

    if (status.status === "COMPLETED") {
      const result = await fal.queue.result(endpoint, { requestId });
      const data = result.data as Record<string, unknown>;
      const video = data.video as { url: string } | undefined;

      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        videoUrl: video?.url,
      });
    }

    return NextResponse.json({
      success: true,
      status: status.status,
      position:
        "queue_position" in status
          ? (status as { queue_position?: number }).queue_position
          : undefined,
    });
  } catch (error) {
    console.error("Status check failed:", error);
    return NextResponse.json(
      { success: false, error: "ステータスの確認に失敗しました" },
      { status: 500 }
    );
  }
}
