import "server-only";

import { defineLive } from "next-sanity";
import { client } from './client'

// Only check for token on server side
const token = process.env.SANITY_API_READ_TOKEN;
if(!token) {
  throw new Error('SANITY_API_READ_TOKEN is not defined. Please set it in your environment variables.');
}

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token, // Viewer token only!
  fetchOptions: { revalidate: 0 },
});