import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://cafe-eret.de",
      lastModified: new Date(),
    },
    {
      url: "https://cafe-eret.de/menu",
      lastModified: new Date(),
    },
    {
      url: "https://cafe-eret.de/about",
      lastModified: new Date(),
    },
    {
      url: "https://cafe-eret.de/contact",
      lastModified: new Date(),
    },
    {
      url: "https://cafe-eret.de/lieferung",
      lastModified: new Date(),
    },
  ];
}