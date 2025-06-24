import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export async function getMyOrders(userId: string) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const MY_ORDER_QUERY = defineQuery(`
    *[_type == "order" && clerkUserId == $userId] | order(orderDate)  {
      _id,
      orderNumber,
      stripeCheckoutSessionId,
      StripePaymentIntentId,
      customerName,
      StripeCustomerId,
      clerkUserId,
      email,
      amountDiscount,
      products[] {
        product->{
          _id,
          name,
          image { asset->{url} },
          price
        },
        quantity
      },
      totalPrice,
      status,
      orderDate
    }
  `);

  try {
    const orders = await sanityFetch({
      query: MY_ORDER_QUERY,
      params: { userId },
    });

    return orders || [];
  } catch (error) {
    console.log("Error fetching orders: ", error);
    throw new Error("Error fetching orders");
  }
}