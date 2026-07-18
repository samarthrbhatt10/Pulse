import { NextRequest, NextResponse } from "next/server";
import { runAgentLoop } from "@/lib/agent/loop";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, context, role, history } = body as {
      query: string;
      context?: string;
      role?: "ops" | "fan";
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const result = await runAgentLoop(query.trim(), context, role || "fan", history);
    return NextResponse.json(result);
  } catch (error) {
    // Catch any SDK-level errors (e.g. empty model output) and serve a mock response
    console.error("Agent API error (outer catch):", String(error));
    // Return a safe fallback instead of 500
    return NextResponse.json({
      reply:
        "I'm processing your request. Our AI is analyzing stadium data — please try again in a moment.",
      toolTrace: [],
      uiHints: { actionType: "overview" },
    });
  }
}
