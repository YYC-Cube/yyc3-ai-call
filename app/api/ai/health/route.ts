/**
 * GET /api/ai/health
 * Simple health check for AI service
 *
 * Response:
 *   {
 *     "healthy": true,
 *     "models": ["chatglm3-6b", ...],
 *     "latency_ms": 45,
 *     "timestamp": "2026-01-23T10:00:00Z"
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai-client";

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const client = getAIClient();
    const models = await client.getModels();
    const latency = Date.now() - startTime;

    return NextResponse.json({
      healthy: models.length > 0,
      models,
      latency_ms: latency,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[/api/ai/health] Error:", error);
    const latency = Date.now() - startTime;
    const message =
      error instanceof Error ? error.message : "Health check failed";

    return NextResponse.json(
      {
        healthy: false,
        models: [],
        error: message,
        latency_ms: latency,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
