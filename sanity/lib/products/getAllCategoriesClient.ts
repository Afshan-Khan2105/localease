import { createClient } from "next-sanity";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-06-01",
  useCdn: true,
});

export const getAllCategoriesClient = async () => {
  return client.fetch(
    `*[_type == "category"] | order(title asc) {
      _id,
      title,
      slug { current },
      description
    }`
  );
};