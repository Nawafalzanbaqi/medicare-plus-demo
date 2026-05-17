import { createImageUrlBuilder } from '@sanity/image-url'
import { dataset, projectId } from '../env'

const builder = projectId ? createImageUrlBuilder({ projectId, dataset }) : null

/** Build a Sanity image URL. Returns null when Sanity isn't configured. */
export function urlForImage(source: unknown) {
  if (!source || !builder) return null
  // The image() signature accepts any Sanity image asset / reference shape.
  return builder
    .image(source as Parameters<typeof builder.image>[0])
    .auto('format')
    .fit('max')
}
