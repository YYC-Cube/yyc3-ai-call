jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));
import { GET } from "@/app/api/ai/health/route";

jest.mock("@/lib/ai-client", () => ({
  getAIClient: () => ({
    getModels: async () => ["chatglm3-6b"],
  }),
}));

describe("GET /api/ai/health", () => {
  it("returns healthy true with models and latency", async () => {
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.healthy).toBe(true);
    expect(Array.isArray(body.models)).toBe(true);
    expect(typeof body.latency_ms).toBe("number");
  });
});
