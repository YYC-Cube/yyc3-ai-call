import { cn } from "@/lib/utils";

describe("cn() edge cases", () => {
  it("ignores falsy non-strings and trims empty", () => {
    // undefined/null/false should be ignored
    expect(cn(undefined as any, null as any, false as any, "")).toBe("");
  });

  it("dedupes and prefers the last conflicting utility", () => {
    expect(cn("px-2 px-3", "px-4")).toBe("px-4");
    expect(cn("mt-1", "mt-2", "mt-3")).toBe("mt-3");
  });

  it("deep flattens arrays and merges objects correctly", () => {
    const out = cn(["p-2", ["p-4", ["p-6"]]], { hidden: false, block: true }, [
      { "font-bold": true },
    ]);
    expect(out).toBe("p-6 block font-bold");
  });
});
