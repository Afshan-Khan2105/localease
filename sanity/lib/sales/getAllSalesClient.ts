import { client } from "../client";


export const getAllSalesClient = async () => {
  const query = `
    *[_type == "sale"] | order(validFrom desc) {
      _id,
      title,
      description,
      discountAmount,
      couponCode,
      validFrom,
      validUntil,
      isActive,
      "backgroundImage": backgroundImage{
        asset->{url}
      }
    }
  `;
  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching all sales (client):", error);
    return [];
  }
};