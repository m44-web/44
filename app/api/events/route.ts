export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { eventBus, AppEvent } from "@/lib/event-bus";

export async function GET() {
  const session = await getSession();
  if (!session || session.userRole !== "admin") {
    return new Response("Unauthorized", { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const handler = (event: AppEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          // stream closed
        }
      };

      eventBus.on("app_event", handler);

      // Send keepalive every 30s
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(keepalive);
        }
      }, 30000);

      // Cleanup when client disconnects (using controller close/error)
      const cleanup = () => {
        eventBus.off("app_event", handler);
        clearInterval(keepalive);
      };

      // Store cleanup function for cancel
      (controller as unknown as Record<string, unknown>).__cleanup = cleanup;
    },
    cancel(controller) {
      const cleanup = (controller as unknown as Record<string, unknown>).__cleanup as (() => void) | undefined;
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
