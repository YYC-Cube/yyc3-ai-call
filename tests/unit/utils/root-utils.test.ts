import { cn } from "@/utils";

describe("root utils cn()", () => {
  it("dedupes conflicting classes via tailwind-merge", () => {
    expect(cn("mt-2", "mt-3")).toBe("mt-3");
  });
});
