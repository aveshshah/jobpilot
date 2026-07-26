import { afterAll, describe, expect, it } from "vitest";
import { app } from "../src/server.js";

afterAll(async () => {
  await app.close();
});

describe("API", () => {
  it("reports health", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });

  it("returns active jobs", async () => {
    const response = await app.inject({ method: "GET", url: "/jobs" });
    expect(response.statusCode).toBe(200);
    expect(response.json().jobs.length).toBeGreaterThan(0);
  });

  it("blocks immediate submission while required profile data is missing", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/applications",
      payload: { jobId: "demo-1", resumeId: "resume-demo", mode: "immediate" }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("blocked");
  });
});
