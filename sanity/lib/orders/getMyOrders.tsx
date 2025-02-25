import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";


export async function getMyOrders(userId: string) {

    if(!userId) {
        throw new Error("User ID is required");
    }

    const MY_ORDER_QUERY = defineQuery(`
        *[_type == "order" && clerkUserId == $userId] | order(orderDate desc) {
            orderNumber,
            orderDate,
            status,
            totalPrice,
            currency,
            amountDiscount,
            products[] {
                quantity,
                product->{
                    _id,
                    name,
                    image,
                    price
                }
            }
        }
    `);
    


    try {
        const order = await sanityFetch({
            query: MY_ORDER_QUERY,
            params: {userId},
        });

        
        
        console.log("fetching orders: ", order.data);

        return order.data || [];
    } catch (error) {
        console.log("Error fetching orders: ", error);
        throw new Error("Error fetching orders");
    }
}