import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shuga",
    short_name: "Shuga",
    description: "Gentle diabetes tracking — sugar, meals and mood.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f1e9",
    theme_color: "#f5f1e9",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
