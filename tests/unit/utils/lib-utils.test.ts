import { cn } from "@/lib/utils";

describe("lib/utils cn()", () => {
  it("merges Tailwind classes preferring the latter", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", "text-base")).toBe("text-base");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      cn("btn", isActive && "btn-active", isDisabled && "btn-disabled"),
    ).toBe("btn btn-active");
  });

  it("flattens arrays and objects", () => {
    expect(cn(["p-2", ["p-4"]], { hidden: false, block: true })).toBe(
      "p-4 block",
    );
  });
});
