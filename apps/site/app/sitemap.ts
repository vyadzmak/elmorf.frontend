import type { MetadataRoute } from "next";
import { parsePublicEnv } from "@elmorf/config/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = parsePublicEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  return [
    {
      url: site,
      alternates: {
        languages: {
          en: site,
          ru: `${site}/ru`,
        },
      },
    },
    {
      url: `${site}/try`,
      alternates: {
        languages: {
          en: `${site}/try`,
          ru: `${site}/ru/try`,
        },
      },
    },
  ];
}
