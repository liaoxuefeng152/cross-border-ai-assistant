import { NextRequest } from "next/server";
import { processMessage } from "@/lib/agent/engine";
import type { AgentEvent } from "@/lib/agent/engine";

export async function POST(request: NextRequest) {
  const { messages: userMessages, sessionId } = await request.json();

  // Get the latest user message
  const lastUserMessage = [...userMessages].reverse().find(
    (m: { role: string }) => m.role === "user"
  );
  const lastMessageText = lastUserMessage?.content || "";

  // Use a default session ID if not provided
  const sid = sessionId || "default-session";

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Event handler: convert AgentEvent to SSE and send
        const onEvent = (event: AgentEvent) => {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        };

        // Process the message through the agent engine
        await processMessage(lastMessageText, sid, onEvent);

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
