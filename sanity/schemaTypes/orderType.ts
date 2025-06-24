import { defineField, defineType } from "sanity";

export const orderType = defineType({
    name: "order",
    title: "Orders",
    type: "document",
    fields: [
        defineField({
            name: "orderNumber",
            title: "Order Number",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "stripeCheckoutSessionId",
            title: "Stripe Checkout Session ID",
            type: "string",
        }),
        defineField({
            name: "StripePaymentIntentId",
            title: "Stripe Payment Intent ID",
            type: "string",
        }),
        defineField({
            name: "customerName",
            title: "Customer Name",
            type: "string",
        }),
        defineField({
            name: "StripeCustomerId",
            title: "Stripe Customer ID",
            type: "string",
        }),
        defineField({
            name: "clerkUserId",
            title: "Clerk User ID",
            type: "string",
        }),
        defineField({
            name: "email",
            title: "Customer Email",
            type: "string",
        }),
        defineField({
            name: "amountDiscount",
            title: "Amount Discount",
            type: "number",
        }),
        defineField({
            name: "products",
            title: "Order Items",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "product", type: "reference", to: [{ type: "product" }] },
                        { name: "quantity", type: "number" },
                    ],
                },
            ],
        }),
        defineField({
            name: "totalPrice",
            title: "Total Price",
            type: "number",
        }),
        defineField({
            name: "status",
            title: "Order Status",
            type: "string",
            options: {
                list: [
                    { title: "Paid", value: "paid" },
                    { title: "Pending", value: "pending" },
                    { title: "Processing", value: "processing" },
                    { title: "Completed", value: "completed" },
                    { title: "Cancelled", value: "cancelled" },
                ],
            },
        }),
        defineField({
            name: "orderDate",
            title: "Order Date",
            type: "datetime",
        }),
    ],
});