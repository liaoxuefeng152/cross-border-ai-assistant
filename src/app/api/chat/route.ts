import { NextRequest } from "next/server";
import { processMessage } from "@/lib/agent/engine";
import type { AgentEvent } from "@/lib/agent/engine";
import { HeaderUtils } from "coze-coding-dev-sdk";
import { saveGeneratedAsset } from "@/lib/agent/asset-saver";

export async function POST(request: NextRequest) {
  const { messages: userMessages, sessionId } = await request.json();

  // Get the latest user message
  const lastUserMessage = [...userMessages].reverse().find(
    (m: { role: string }) => m.role === "user"
  );
  const lastMessageText = lastUserMessage?.content || "";

  // Use a default session ID if not provided
  const sid = sessionId || "default-session";

  // Extract forward headers for SDK auth
  const forwardHeaders = HeaderUtils.extractForwardHeaders(request.headers);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Event handler: convert AgentEvent to SSE and send
        const onEvent = async (event: AgentEvent) => {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));

          // Save generated images to assets table
          if (event.type === "skill-result" && event.skill === "image-gen" && event.status === "success") {
            const imageData = event.data as { imageUrls?: string[]; prompt?: string; scene?: string };
            if (imageData?.imageUrls) {
              for (const url of imageData.imageUrls) {
                await saveGeneratedAsset(url, imageData.prompt || lastMessageText, "image");
              }
            }
          }

          // Save generated videos to assets table
          if (event.type === "skill-result" && event.skill === "video-gen" && event.status === "success") {
            const videoData = event.data as { videoUrl?: string; prompt?: string; scene?: string };
            if (videoData?.videoUrl) {
              await saveGeneratedAsset(videoData.videoUrl, videoData.prompt || lastMessageText, "video");
            }
          }
        };

        // Process the message through the agent engine (engine handles message persistence)
        await processMessage(lastMessageText, sid, onEvent, forwardHeaders);

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        const data = `data: ${JSON.stringify({ type: "error", message: errMsg })}\n\n`;
        controller.enqueue(encoder.encode(data));
        controller.close();
      }
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
