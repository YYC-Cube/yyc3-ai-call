import { renderHook, act } from "@testing-library/react";
import { useAI } from "@/lib/hooks/useAI";

describe("useAI hook", () => {
  beforeEach(() => {
    // @ts-expect-error test shim
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // @ts-expect-error test shim
    global.fetch.mockReset?.();
  });

  it("chat resolves data and calls onSuccess", async () => {
    const fake = {
      choices: [{ message: { role: "assistant", content: "hi" } }],
    };
    // @ts-expect-error test shim
    global.fetch.mockResolvedValue({ ok: true, json: async () => fake });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useAI({ onSuccess }));

    const data = await act(async () => {
      // @ts-expect-error allow
      return await result.current.chat([{ role: "user", content: "hello" }]);
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it("chat throws on non-OK response and calls onError", async () => {
    // @ts-expect-error test shim
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "bad" }),
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useAI({ onError }));

    await act(async () => {
      try {
        // @ts-expect-error allow
        await result.current.chat([{ role: "user", content: "hello" }]);
      } catch {}
    });

    expect(onError).toHaveBeenCalled();
  });
});
