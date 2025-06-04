'use server'

import { imageUrl } from "@/lib/imageUrl";
import stripe from "@/lib/stripe";
import { BasketItem } from "@/store/store";

export type Metadata = {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    clerkUserId: string;
}

export type GroupedBasketItem = {
    product: BasketItem["product"];
    quantity: number;
};


export async function createCheckoutSession(
    items: GroupedBasketItem[],
    metadata: Metadata
) {
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
        throw new Error("BASE_URL environment variable is not set");
    }

    try {
        // Validate items more strictly
        const validItems = items.filter(
            item => 
                item.product && 
                item.product._id && 
                typeof item.product.price === 'number' &&
                item.product.price > 0
        );

        if (!validItems.length) {
            throw new Error("No valid items in basket");
        }

        // Get or create customer
        const customers = await stripe.customers.list({
            email: metadata.customerEmail,
            limit: 1,
        });
        
        const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

        // Set base URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            customer_creation: customerId ? undefined : "always",
            customer_email: !customerId ? metadata.customerEmail : undefined,
            metadata,
            mode: "payment",
            allow_promotion_codes: true,
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${metadata.orderNumber}`,
            cancel_url: `${baseUrl}/basket`,
            line_items: validItems.map((item) => ({
                price_data: {
                    currency: "inr",
                    unit_amount: Math.round((item.product?.price || 0) * 100),
                    product_data: {
                        name: item.product?.name || "Unnamed Product",
                        description: `Product ID: ${item.product?._id}`,
                        metadata: {
                            id: item.product?._id,
                        },
                        images: item.product?.image
                            ? [imageUrl(item.product.image).url()]
                            : undefined,
                    },
                },
                quantity: item.quantity,
            })),
        });

        if (!session?.url) {
            throw new Error("Failed to create checkout session");
        }
         
        return session.url;
    } catch (error) {
        console.error("Error creating checkout session:", error);
        throw error;
    }
}