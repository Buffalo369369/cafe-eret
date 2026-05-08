import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://eret-cafe.de",
      lastModified: new Date(),
    },
    {
      url: "https://eret-cafe.de/menu",
      lastModified: new Date(),
    },
    {
      url: "https://eret-cafe.de/about",
      lastModified: new Date(),
    },
    {
      url: "https://eret-cafe.de/contact",
      lastModified: new Date(),
    },
    {
      url: "https://eret-cafe.de/lieferung",
      lastModified: new Date(),
    },
  ];
}