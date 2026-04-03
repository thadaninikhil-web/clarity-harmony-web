import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const sanityClient = createClient({
  projectId: "8aezhip3",
  dataset: "production",
  apiVersion: "2026-04-03", // ✅ use a stable date, not a future one
  useCdn: true,
});

const builder = createImageUrlBuilder(sanityClient);

type SanityImageSource = Parameters<
  ReturnType<typeof createImageUrlBuilder>["image"]
>[0];

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
