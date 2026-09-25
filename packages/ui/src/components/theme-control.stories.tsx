import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useTranslations } from "next-intl";
import { ThemeControl, type ThemeChoice } from "./theme-control";

function ThemeControlStory() {
  const t = useTranslations("Foundation");
  const options: { value: ThemeChoice; label: string }[] = [
    { value: "light", label: t("themeLight") },
    { value: "dark", label: t("themeDark") },
    { value: "system", label: t("themeSystem") },
  ];

  return <ThemeControl label={t("themeLabel")} options={options} />;
}

const meta = {
  title: "UI/ThemeControl",
  component: ThemeControlStory,
} satisfies Meta<typeof ThemeControlStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
