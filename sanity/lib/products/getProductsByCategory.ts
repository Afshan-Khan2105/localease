import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getProductsByCategory = async (categorySlug: string) => {
  const PRODUCTS_BY_CATEGORY_QUERY = defineQuery(`
    *[
      _type == "product"
      && references(*[_type == "category" && slug.current == $categorySlug]._id)
    ] | order(name asc) {
      _id,
      name,
      slug { current },
      image { asset->{ url } },
      images[] { asset->{ url } },
      description,
      price,
      stock,
      "categories": categories[]-> { _id, title, slug },
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
      query: PRODUCTS_BY_CATEGORY_QUERY,
      params: {
        categorySlug,
      },
    });

    return product.data || [];
  } catch (error) {
    console.error("Error fetching products by category: ", error);
    return [];
  }
}