import { describe, expect, it } from "vitest";
import { alertCountLabel } from "./alert-label";

describe("alertCountLabel", () => {
  it("uses singular for one alert", () => {
    expect(alertCountLabel(1)).toBe("1 alert");
  });

  it("uses plural for zero or multiple alerts", () => {
    expect(alertCountLabel(0)).toBe("0 alerts");
    expect(alertCountLabel(2)).toBe("2 alerts");
    expect(alertCountLabel(3)).toBe("3 alerts");
  });
});
