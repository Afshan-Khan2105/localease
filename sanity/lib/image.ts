import createImageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

/**
 * Returns a Sanity image URL builder for the given source.
 * Usage: urlFor(image).width(400).height(300).url()
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
