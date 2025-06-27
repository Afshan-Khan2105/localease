import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllProducts = async () => {
  const ALL_PRODUCTS_QUERY = defineQuery(`
    *[_type == "product"] | order(name asc) {
      _id,
      name,
      slug { current },
      image { asset->{ url } },
      images[] { asset->{ url } },
      description,
      price,
      stock,
      "categories": categories[]-> { _id, title, slug },
       owner {
      id,
      email
      },
      location {
        latitude,
        longitude,
        address,
        radius
      },
      ratings[] {
        username,
        score,
        comment,
        createdAt
      }
    }
  `);

  try {
    const product = await sanityFetch({
      query: ALL_PRODUCTS_QUERY,
    });
    return product.data || [];
  } catch (error) {
    console.error("Error fetching all products: ", error);
    return [];
  }
};

