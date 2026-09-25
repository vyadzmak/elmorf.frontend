import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "../src/components/theme-provider";
import { getDirection, pseudoLocalize, type Locale } from "@elmorf/i18n";
import en from "@elmorf/i18n/messages/en/common.json";
import ru from "@elmorf/i18n/messages/ru/common.json";
import "../src/styles/globals.css";

function localize(value: unknown, locale: string): unknown {
  if (typeof value === "string") {
    return locale === "pseudo" ? pseudoLocalize(value) : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => localize(item, locale));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, localize(item, locale)]),
    );
  }

  return value;
}

const withProviders: Decorator = (Story, context) => {
  const theme = context.globals.theme === "dark" ? "dark" : "light";
  const locale = context.globals.locale === "ru" ? "ru" : "en";
  const messages =
    context.globals.locale === "pseudo"
      ? localize(en, "pseudo")
      : locale === "ru"
        ? ru
        : en;

  document.documentElement.lang = locale;
  document.documentElement.dir = getDirection(locale);

  return (
    <ThemeProvider forcedTheme={theme}>
      <NextIntlClientProvider
        locale={locale as Locale}
        messages={messages as typeof en}
      >
        <Story />
      </NextIntlClientProvider>
    </ThemeProvider>
  );
};

const preview: Preview = {
  initialGlobals: {
    theme: "dark",
    locale: "en",
  },
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: "Locale",
      toolbar: {
        icon: "globe",
        items: [
          { value: "en", title: "English" },
          { value: "ru", title: "Russian" },
          { value: "pseudo", title: "Pseudo" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withProviders],
};

export default preview;
