import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
 // Use the secret token for write access
});