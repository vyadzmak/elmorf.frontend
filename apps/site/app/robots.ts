import type { MetadataRoute } from "next";
import { parsePublicEnv } from "@elmorf/config/env";

export default function robots(): MetadataRoute.Robots {
  const site = parsePublicEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${site}/sitemap.xml`,
  };
}
