import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllProducts = async () => {
  // Optimized query to fetch only the required fields from each product
  const ALL_PRODUCTS_QUERY = defineQuery(`
      *[_type == "product"] | order(name asc) {
      _id,
      name,
      slug,
      image{
        asset->{
          url
        }
      },
      images[]{
        asset->{
          url
        }
      },
      description,
      price,
      stock,
      "categories": categories[]->,
      location {
        latitude,
        longitude,
        address,
        selected {
          lat,
          lng
        },
        zoom,
        radius
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
