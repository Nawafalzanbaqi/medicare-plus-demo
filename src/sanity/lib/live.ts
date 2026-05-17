/**
 * Live preview wiring. Activated only once a real Sanity project is
 * configured. To enable, uncomment the defineLive block below and
 * import `<SanityLive />` into your root layout.
 */

// import { defineLive } from 'next-sanity'
// import { getSanityClient } from './client'

// const client = getSanityClient()
// export const { sanityFetch: liveSanityFetch, SanityLive } = client
//   ? defineLive({ client })
//   : { sanityFetch: null, SanityLive: () => null }

export {}
