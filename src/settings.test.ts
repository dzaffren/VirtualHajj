import { describe, expect, it } from "vitest";
import { pickHints, pickLang } from "./settings";

describe("pickHints", () => {
  it("is off only when off is stored", () => {
    expect(pickHints("off")).toBe(false);
    expect(pickHints("on")).toBe(true);
  });

  it("is on when nothing, or an unknown value, is stored", () => {
    expect(pickHints(null)).toBe(true);
    expect(pickHints("false")).toBe(true);
  });
});

describe("pickLang", () => {
  it("takes a stored language over the browser's", () => {
    expect(pickLang("ms", "en-GB")).toBe("ms");
    expect(pickLang("en", "ms-MY")).toBe("en");
  });

  it("is Malay when the browser's first language is Malay", () => {
    expect(pickLang(null, "ms-MY")).toBe("ms");
    expect(pickLang(null, "ms")).toBe("ms");
  });

  it("is English for any other first language, or none", () => {
    expect(pickLang(null, "en-US")).toBe("en");
    expect(pickLang(null, "id-ID")).toBe("en");
    expect(pickLang(null, undefined)).toBe("en");
  });

  it("ignores an unknown stored value", () => {
    expect(pickLang("fr", "ms-MY")).toBe("ms");
  });
});
