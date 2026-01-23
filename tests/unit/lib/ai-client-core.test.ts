import { AIClient } from "@/lib/ai-client";

describe("AIClient core methods", () => {
  it("extractText returns empty string on empty choices", () => {
    const client = new AIClient("http://x", "m");
    // @ts-expect-error minimal shape for test
    const res = { choices: [] };
    expect(client.extractText(res)).toBe("");
  });

  it("extractText returns message content when present", () => {
    const client = new AIClient("http://x", "m");
    // @ts-expect-error minimal shape for test
    const res = {
      choices: [{ message: { role: "assistant", content: "hello" } }],
    };
    expect(client.extractText(res)).toBe("hello");
  });

  it("classifyIntent falls back when JSON parse fails", async () => {
    const client = new AIClient("http://x", "m");
    const spy = jest
      .spyOn(client as any, "chat")
      // @ts-expect-error minimal shape for test
      .mockResolvedValue({ choices: [{ message: { content: "not json" } }] });

    const out = await client.classifyIntent("refund");
    expect(out.intent).toBe("other");
    expect(out.confidence).toBeCloseTo(0.5);
    spy.mockRestore();
  });

  it("classifyIntent returns parsed JSON and respects custom intents", async () => {
    const client = new AIClient("http://x", "m");
    const payload = { intent: "billing", confidence: 0.88 };
    const spy = jest
      .spyOn(client as any, "chat")
      // @ts-expect-error minimal shape for test
      .mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(payload) } }],
      });

    const out = await client.classifyIntent("pay", ["billing", "sales"]);
    expect(out).toEqual(payload);
    spy.mockRestore();
  });

  it("analyzeSentiment falls back on parse error", async () => {
    const client = new AIClient("http://x", "m");
    const spy = jest
      .spyOn(client as any, "chat")
      // @ts-expect-error minimal shape for test
      .mockResolvedValue({ choices: [{ message: { content: "oops" } }] });

    const out = await client.analyzeSentiment("text");
    expect(out.sentiment).toBe("neutral");
    expect(out.score).toBe(0);
    spy.mockRestore();
  });

  it("analyzeSentiment returns parsed JSON", async () => {
    const client = new AIClient("http://x", "m");
    const payload = { sentiment: "positive", score: 0.9 } as const;
    const spy = jest
      .spyOn(client as any, "chat")
      // @ts-expect-error minimal shape for test
      .mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(payload) } }],
      });

    const out = await client.analyzeSentiment("yay");
    expect(out).toEqual(payload);
    spy.mockRestore();
  });
});
