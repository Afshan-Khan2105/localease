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
            name: "customerName",
            title: "Customer Name",
            type: "string",
        }),
        defineField({
            name: "customerEmail",
            title: "Customer Email",
            type: "string",
        }),
        defineField({
            name: "clerkUserId",
            title: "Clerk User ID",
            type: "string",
        }),
        defineField({
            name: "items",
            title: "Order Items",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        { name: "product", type: "reference", to: [{ type: "product" }] },
                        { name: "quantity", type: "number" },
                        { name: "price", type: "number" },
                        { name: "productName", type: "string" },
                        { 
                            name: "productImage", 
                            type: "image",
                            options: { hotspot: true }
                        },
                    ],
                },
            ],
        }),
        defineField({
            name: "totalAmount",
            title: "Total Amount",
            type: "number",
        }),
        defineField({
            name: "status",
            title: "Order Status",
            type: "string",
            options: {
                list: [
                    { title: "Pending", value: "pending" },
                    { title: "Processing", value: "processing" },
                    { title: "Completed", value: "completed" },
                    { title: "Cancelled", value: "cancelled" },
                ],
            },
        }),
        defineField({
            name: "paymentStatus",
            title: "Payment Status",
            type: "string",
            options: {
                list: [
                    { title: "Pending", value: "pending" },
                    { title: "Paid", value: "paid" },
                    { title: "Failed", value: "failed" },
                ],
            },
        }),
        defineField({
            name: "createdAt",
            title: "Created At",
            type: "datetime",
        }),
    ],
});