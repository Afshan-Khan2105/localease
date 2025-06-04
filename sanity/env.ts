function assertValue<T>(v: T | undefined | null, errorMessage: string): T {
  if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
    throw new Error(errorMessage)
  }
  return v
}

export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-11'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

// Optionally, export all config as an object
export const sanityConfig = {
  apiVersion,
  dataset,
  projectId,
}
