import { defineLive } from "next-sanity";
import { client } from './client'

// Only check for token on server side
const token = typeof window === 'undefined' ? process.env.SANITY_API_READ_TOKEN : undefined;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: process.env.NEXT_PUBLIC_SANITY_READ_TOKEN || '', // Viewer token only!
  fetchOptions: { revalidate: 60 },
});