import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://occhiale.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/onboarding/",
          "/api/",
          "/login",
          "/cadastro",
          "/recuperar-senha",
          "/redefinir-senha",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
