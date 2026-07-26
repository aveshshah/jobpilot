import { describe, expect, it } from "vitest";
import { validatePreflight } from "../src/application-engine.js";

describe("application preflight", () => {
  it("blocks an incomplete profile", () => {
    expect(validatePreflight({}, undefined)).toContain("No résumé selected");
  });

  it("accepts a complete core profile and résumé", () => {
    expect(validatePreflight({
      fullName: "Test User",
      email: "test@example.com",
      phone: "555-0100",
      authorizedInUS: true,
      requiresSponsorship: false
    }, {
      id: "r1",
      name: "Controls",
      originalName: "resume.pdf",
      storageKey: "resumes/r1",
      isDefault: true
    })).toEqual([]);
  });
});
