import { describe, expect, it } from "vitest";
import {
  getDirection,
  pseudoLocalize,
  resolveLocaleFromAcceptLanguage,
  resolveRequestLocale,
} from "./index";

describe("locale resolution", () => {
  it("keeps English and Russian left-to-right and marks Arabic as right-to-left", () => {
    expect(getDirection("en")).toBe("ltr");
    expect(getDirection("ru")).toBe("ltr");
    expect(getDirection("ar")).toBe("rtl");
  });

  it("matches a supported language from Accept-Language", () => {
    expect(resolveLocaleFromAcceptLanguage("ru-RU,ru;q=0.9,en;q=0.8")).toBe(
      "ru",
    );
    expect(resolveLocaleFromAcceptLanguage("fr,en;q=0.8")).toBe("en");
    expect(resolveLocaleFromAcceptLanguage(null)).toBe("en");
  });

  it("prefers a valid locale cookie over the browser language", () => {
    expect(
      resolveRequestLocale({
        cookieLocale: "ru",
        acceptLanguage: "en-US,en;q=0.9",
      }),
    ).toBe("ru");
    expect(
      resolveRequestLocale({
        cookieLocale: "de",
        acceptLanguage: "en-US,en;q=0.9",
      }),
    ).toBe("en");
  });

  it("stretches copy for pseudo-localization without dropping ICU tokens", () => {
    expect(pseudoLocalize("{count, plural, one {# source} other {# sources}}")).toContain(
      "{count, plural, one {# source} other {# sources}}",
    );
  });
});
