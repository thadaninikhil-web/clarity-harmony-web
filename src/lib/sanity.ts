import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const sanityClient = createClient({
  projectId: "sz2bbj04",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);

type SanityImageSource = Parameters<ReturnType<typeof imageUrlBuilder>["image"]>[0];

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
