jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

import { GET } from "@/app/api/customers/route";

describe("GET /api/customers", () => {
  it("filters, paginates, and returns success payload", async () => {
    const url =
      "http://localhost/api/customers?page=1&limit=1&search=张&status=new";
    const res = await GET({ url } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.data.customers)).toBe(true);
    expect(body.data.customers.length).toBeLessThanOrEqual(1);
    expect(body.data.pages).toBeGreaterThanOrEqual(1);
  });
});
