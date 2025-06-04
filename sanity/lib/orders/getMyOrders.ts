import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export async function getMyOrders(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const MY_ORDER_QUERY = defineQuery(`
    *[_type == "order" && clerkUserId == $userId] | order(createdAt desc) {
      _id,
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items[] {
        product->{
          _id,
          name,
          image { asset->{url} },
          price
        },
        productName,
        productImage { asset->{url} },
        quantity,
        price,
        total
      },
      totalAmount,
      paymentStatus,
      paymentMethod,
      status,
      coupon->{
        _id,
        title,
        discountAmount,
        couponCode
      },
      orderNotes,
      createdAt,
      updatedAt
    }
  `);

  try {
    const order = await sanityFetch({
      query: MY_ORDER_QUERY,
      params: { userId },
    });

    return order.data || [];
  } catch (error) {
    console.log("Error fetching orders: ", error);
    throw new Error("Error fetching orders");
  }
}